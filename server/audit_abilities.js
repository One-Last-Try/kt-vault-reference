/**
 * Kill Team Vault – Ability Text Auditor
 *
 * Extracts ability text from Datacard PDFs and diffs against the SQLite DB.
 * Outputs ability_diffs.json for use by fix_abilities.js
 *
 * Run from server/:
 *   node audit_abilities.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import db from './db/schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PDF_BASE  = 'C:\\Users\\serka\\OneDrive\\Desktop\\Kill Team\\Teams PDFs';
const OUT       = path.join(__dirname, 'ability_diffs.json');

const SKIP_FOLDERS = new Set([
  'General', 'Mission Packs', 'Core_Rules', 'Errata_FAQ', 'White_Dwarf', 'Uncategorised'
]);

// Stats anchor — same as audit.js
const STATS_RX = /(\d)\s+APL\s+WOUNDS\s+SAVE\s+MOVE\s+([\d"]+)\s+(\d)\s*\+\s+(\d+)/g;

// ─── PDF extraction ────────────────────────────────────────────────────────────

async function extractPdfPages(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    const doc = await getDocument({ data: new Uint8Array(buf) }).promise;
    const pages = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      pages.push(content.items.map(it => it.str).join(' '));
    }
    return pages;
  } catch {
    return null;
  }
}

// ─── Extract ability block from a page (text between weapons and keyword line) ─

function extractAbilityBlock(rawPage, statsMatchIndex) {
  const before = rawPage.slice(0, statsMatchIndex).trim();

  // Find last lowercase letter — everything after it is all-caps (keywords + name)
  let lastLowerIdx = -1;
  for (let i = before.length - 1; i >= 0; i--) {
    if (before[i] >= 'a' && before[i] <= 'z') { lastLowerIdx = i; break; }
  }

  // Mixed-case section (abilities live here)
  const mixedSection = lastLowerIdx === -1 ? '' : before.slice(0, lastLowerIdx + 1).trim();

  // Strip leading weapon table header + weapon rows
  // Weapon rows end when mixed-case ability text or end of weapons begins.
  // The NAME ATK HIT DMG WR header marks the weapon table start.
  const headerIdx = mixedSection.search(/NAME\s+ATK\s+HIT\s+DMG\s+WR/i);
  if (headerIdx === -1) return mixedSection;

  // After the header, weapon rows look like:
  //   WeaponName   digits   digits+   digits/digits   rules
  // The last weapon row ends just before the first ability line.
  // Abilities start either with a Title-case word followed by ':' or
  // an ALL-CAPS action name.
  // Strategy: take everything after the weapon header, then strip leading
  // weapon stat lines (lines that are mostly digits/symbols).
  const afterHeader = mixedSection.slice(headerIdx + 20).trim();

  // Split into tokens by 2+ spaces to isolate ability text
  // Weapon rows contain patterns like:  "4   3+   3/4   -"
  // Find the position where non-weapon content starts:
  // Scan forward looking for a segment that contains a letter-word > 3 chars
  // that isn't a weapon stat fragment.
  const weaponRowRx = /^[\d"\/+\-–\s,A-Z]{1,60}$/;

  // Split the afterHeader on 2+ spaces to get chunks
  const chunks = afterHeader.split(/\s{2,}/);
  let abilityStart = chunks.length; // default: no abilities found

  // Walk chunks; once we see a chunk with a word ≥4 lowercase chars, that's ability text
  for (let i = 0; i < chunks.length; i++) {
    if (/[a-z]{4,}/.test(chunks[i])) {
      // Back up to include the preceding chunk (could be the ability name in ALL CAPS)
      abilityStart = Math.max(0, i - 1);
      break;
    }
  }

  if (abilityStart === chunks.length) return ''; // no abilities on this page

  return chunks.slice(abilityStart).join('  ').trim();
}

// ─── Normalise for comparison ──────────────────────────────────────────────────

function norm(s) {
  return (s ?? '')
    .replace(/\s+/g, ' ')
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .toLowerCase()
    .trim();
}

// Build a single normalised string from all DB abilities for an operative
function dbAbilityText(abilitiesJson) {
  try {
    const arr = JSON.parse(abilitiesJson || '[]');
    return arr.map(a => `${a.name || ''} ${a.description || ''}`).join(' ');
  } catch {
    return '';
  }
}

// ─── Per-operative diff ────────────────────────────────────────────────────────

function wordDiff(pdfText, dbText) {
  const pdfWords = new Set(norm(pdfText).split(/\s+/).filter(Boolean));
  const dbWords  = new Set(norm(dbText).split(/\s+/).filter(Boolean));

  const inDbNotPdf = [...dbWords].filter(w => !pdfWords.has(w) && w.length > 3);
  const inPdfNotDb = [...pdfWords].filter(w => !dbWords.has(w) && w.length > 3);

  return { inDbNotPdf, inPdfNotDb };
}

// ─── Parse all operatives from PDF (mirrors audit.js logic) ───────────────────

function parsePdfOperatives(pages) {
  const results = [];
  for (const rawPage of pages) {
    const statsMatches = [...rawPage.matchAll(STATS_RX)];
    if (!statsMatches.length) continue;

    for (const sm of statsMatches) {
      const before = rawPage.slice(0, sm.index).trim();

      // Get operative name (same as audit.js)
      let lastLowerIdx = -1;
      for (let i = before.length - 1; i >= 0; i--) {
        if (before[i] >= 'a' && before[i] <= 'z') { lastLowerIdx = i; break; }
      }
      const allCaps = (lastLowerIdx === -1 ? before : before.slice(lastLowerIdx + 1)).trim();
      if (!allCaps || !allCaps.includes(',')) continue;

      const lastDoubleSpace = allCaps.lastIndexOf('  ');
      if (lastDoubleSpace === -1) continue;
      const opName = allCaps.slice(lastDoubleSpace).trim();
      if (!opName) continue;

      const abilityBlock = extractAbilityBlock(rawPage, sm.index);
      results.push({ name: opName, abilityBlock });
    }
  }
  return results;
}

// ─── Faction audit ────────────────────────────────────────────────────────────

async function auditFaction(factionFolder) {
  const name = path.basename(factionFolder);
  const datacardPath = path.join(factionFolder, 'Datacard.pdf');
  if (!fs.existsSync(datacardPath)) return null;

  const pages = await extractPdfPages(datacardPath);
  if (!pages) return null;

  const dbFaction = db.prepare('SELECT * FROM factions WHERE name = ?').get(name);
  if (!dbFaction) return null;

  const dbCards = db.prepare('SELECT * FROM datacards WHERE faction_id = ?').all(dbFaction.id);
  const pdfOps  = parsePdfOperatives(pages);

  const diffs = [];

  for (const po of pdfOps) {
    const dc = dbCards.find(c =>
      c.operative_name.toUpperCase().trim() === po.name.toUpperCase().trim()
    );
    if (!dc) continue;

    const dbText  = dbAbilityText(dc.abilities_json);
    const pdfText = po.abilityBlock;

    if (!pdfText && !dbText) continue;

    const { inDbNotPdf, inPdfNotDb } = wordDiff(pdfText, dbText);

    // Only flag if there are suspicious words in DB not found in PDF
    // (words that were likely added incorrectly, length > 3 to skip noise)
    const suspicious = inDbNotPdf.filter(w =>
      // Skip common words that appear in faction names, keywords, etc.
      !/^(this|that|the|and|for|its|one|can|two|may|not|are|was|has|you|all|any|if|of|to|in|is|it|at|as|be|or|an|by)$/.test(w)
    );

    if (suspicious.length > 0 || inPdfNotDb.length > 0) {
      diffs.push({
        operative: dc.operative_name,
        pdfAbilityBlock: pdfText,
        dbAbilityText: dbText,
        inDbNotPdf: suspicious,
        inPdfNotDb: inPdfNotDb.filter(w =>
          !/^(this|that|the|and|for|its|one|can|two|may|not|are|was|has|you|all|any|if|of|to|in|is|it|at|as|be|or|an|by)$/.test(w)
        ),
      });
    }
  }

  return diffs.length ? { faction: name, diffs } : null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Kill Team Vault – Ability Audit\n');

  const factionFolders = fs.readdirSync(PDF_BASE)
    .filter(f => !SKIP_FOLDERS.has(f))
    .map(f => path.join(PDF_BASE, f))
    .filter(f => fs.statSync(f).isDirectory())
    .sort();

  const allDiffs = [];
  let totalDiffs = 0;

  for (const folder of factionFolders) {
    const name = path.basename(folder);
    process.stdout.write(`  ${name.padEnd(40)}`);
    const result = await auditFaction(folder);
    if (result) {
      allDiffs.push(result);
      totalDiffs += result.diffs.length;
      console.log(`${result.diffs.length} diff(s)`);
    } else {
      console.log('ok');
    }
  }

  fs.writeFileSync(OUT, JSON.stringify(allDiffs, null, 2));
  console.log(`\nTotal operatives with ability diffs: ${totalDiffs}`);
  console.log(`Output → ${OUT}`);

  // Print summary of suspicious words found in DB but not PDF
  console.log('\n─── Suspicious words in DB not in PDF ───────────────────');
  for (const r of allDiffs) {
    for (const d of r.diffs) {
      if (d.inDbNotPdf.length) {
        console.log(`  [${r.faction}] ${d.operative}`);
        console.log(`    DB extra words: ${d.inDbNotPdf.join(', ')}`);
      }
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
