/**
 * Kill Team Vault – PDF Audit Script
 *
 * Reads Datacard PDFs using pdfjs-dist, extracts operative data verbatim,
 * then diffs against the SQLite database.
 *
 * Outputs:
 *   audit_report.txt  – human-readable diff per faction
 *   audit_raw.json    – full structured data
 *
 * Run from server/:
 *   node audit.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import db from './db/schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PDF_BASE   = 'C:\\Users\\serka\\OneDrive\\Desktop\\Kill Team\\Teams PDFs';
const REPORT_OUT = path.join(__dirname, 'audit_report.txt');
const RAW_OUT    = path.join(__dirname, 'audit_raw.json');

// Non-faction download folders to skip
const SKIP_FOLDERS = new Set([
  'General', 'Mission Packs', 'Core_Rules', 'Errata_FAQ', 'White_Dwarf', 'Uncategorised'
]);

// ─── PDF text extraction ─────────────────────────────────────────────────────

async function extractPdfPages(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    const doc = await getDocument({ data: new Uint8Array(buf) }).promise;
    const pages = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page    = await doc.getPage(i);
      const content = await page.getTextContent();
      pages.push(content.items.map(it => it.str).join(' '));
    }
    return pages;
  } catch {
    return null;
  }
}

// ─── Datacard parser ──────────────────────────────────────────────────────────
// PDF page structure (all on one line when joined):
//
//   "NAME  ATK  HIT  DMG  WR  {weapon rows}  {ability rows}
//    KEYWORD1   , KEYWORD2, KEYWORD3, KN  OPERATIVE NAME   {APL} APL
//    WOUNDS SAVE MOVE {MOVE}   {SAVE}   {WOUNDS}  [cost]"
//
// The stats anchor `\d APL   WOUNDS SAVE MOVE` appears once per operative.
// We split the full page text by this anchor, then parse backwards.

// Stats block: "{APL} APL   WOUNDS SAVE MOVE {MOVE}   {SAVE_DIGIT} +   {WOUNDS}"
// SAVE appears as "3 +" (digit, space, plus) in the extracted PDF text.
const STATS_RX = /(\d)\s+APL\s+WOUNDS\s+SAVE\s+MOVE\s+([\d"]+)\s+(\d)\s*\+\s+(\d+)/g;

function parseDatacardPages(pages) {
  const operatives = [];

  for (const rawPage of pages) {
    const statsMatches = [...rawPage.matchAll(STATS_RX)];
    if (!statsMatches.length) continue;

    for (const sm of statsMatches) {
      const stats = {
        APL:    sm[1],
        MOVE:   sm[2].includes('"') ? sm[2] : sm[2] + '"',
        SAVE:   sm[3] + '+',
        WOUNDS: sm[4],
      };

      const before = rawPage.slice(0, sm.index).trim();

      // ── Isolate the all-caps zone ──────────────────────────────────────
      // Scan backwards to find the last lowercase letter.
      // Everything AFTER it is the all-caps zone (keywords + operative name).
      let lastLowerIdx = -1;
      for (let i = before.length - 1; i >= 0; i--) {
        if (before[i] >= 'a' && before[i] <= 'z') { lastLowerIdx = i; break; }
      }
      const allCaps = (lastLowerIdx === -1 ? before : before.slice(lastLowerIdx + 1)).trim();

      // Continuation pages (abilities overflow) have no keyword commas → skip
      if (!allCaps || !allCaps.includes(',')) continue;

      // ── Split keywords from operative name ─────────────────────────────
      // Format: "KW1   , KW2, KW3, LAST_KW  OPERATIVE NAME"
      // Operative name follows the LAST run of 2+ spaces.
      const lastDoubleSpace = allCaps.lastIndexOf('  ');
      if (lastDoubleSpace === -1) continue;

      const kwRaw  = allCaps.slice(0, lastDoubleSpace);
      const opName = allCaps.slice(lastDoubleSpace).trim();
      if (!opName) continue;

      // Strip leading weapon-stat fragments (digits, dashes, dots) before the
      // first run of 2+ consecutive uppercase letters (start of keywords).
      const kwStart = kwRaw.search(/[A-Z]{2,}/);
      if (kwStart === -1) continue;

      // Normalise keywords: "ANGEL OF DEATH   ," → "ANGEL OF DEATH,"
      const keywords = kwRaw.slice(kwStart)
        .replace(/\s{2,},\s*/g, ', ')
        .replace(/,\s*/g, ', ')
        .trim();

      // ── Extract weapons ────────────────────────────────────────────────
      const weapons = [];
      const headerIdx = rawPage.search(/NAME\s+ATK\s+HIT\s+DMG\s+WR/i);
      if (headerIdx !== -1) {
        const weaponSection = rawPage.slice(headerIdx + 24, sm.index);
        const wRx = /([A-Za-z][A-Za-z0-9()'\- ]+?)\s{2,}(\d)\s{2,}(\d\+)\s{2,}(\d+\/\d+)\s{2,}(.*?)(?=\s{2,}[A-Za-z(]|$)/g;
        for (const wm of weaponSection.matchAll(wRx)) {
          weapons.push({
            name: wm[1].trim(),
            atk:  wm[2],
            hit:  wm[3],
            dmg:  wm[4],
            wr:   wm[5].replace(/\s+/g, ' ').trim() || '–',
          });
        }
      }

      operatives.push({ name: opName, keywords, stats, weapons });
    }
  }

  return operatives;
}

// ─── DB helpers ───────────────────────────────────────────────────────────────

const getDbFaction = name =>
  db.prepare('SELECT * FROM factions WHERE name = ?').get(name);
const getDbCards = id =>
  db.prepare('SELECT * FROM datacards WHERE faction_id = ?').all(id);

// ─── Comparison helpers ───────────────────────────────────────────────────────

function norm(s) { return String(s ?? '').replace(/\s+/g, ' ').trim(); }
function normKw(s) {
  return norm(s).toUpperCase()
    .replace(/\s*,\s*/g, ', ')
    .replace(/[""]/g, '"');
}

function statDiff(dbStats, pdfStats) {
  const out = [];
  for (const k of ['APL', 'MOVE', 'SAVE', 'WOUNDS']) {
    const d = norm(dbStats[k] ?? '').replace(/[""]/g, '"');
    const p = norm(pdfStats[k] ?? '').replace(/[""]/g, '"');
    if (d && p && d !== p) out.push({ stat: k, db: d, pdf: p });
  }
  return out;
}

function weaponDiff(dbWeapons, pdfWeapons) {
  const out = [];
  for (const pw of pdfWeapons) {
    const dw = dbWeapons.find(w =>
      norm(w.name).toLowerCase() === norm(pw.name).toLowerCase()
    );
    if (!dw) { out.push({ type: 'missing', weapon: pw.name }); continue; }
    const fd = [];
    for (const k of ['atk', 'hit', 'dmg']) {
      if (norm(dw[k]) !== norm(pw[k]))
        fd.push({ field: k, db: norm(dw[k]), pdf: norm(pw[k]) });
    }
    const dwr = norm(dw.wr ?? '').replace(/^-$/, '–');
    const pwr = norm(pw.wr).replace(/^-$/, '–');
    if (dwr !== pwr) fd.push({ field: 'wr', db: dwr, pdf: pwr });
    if (fd.length) out.push({ weapon: pw.name, fields: fd });
  }
  return out;
}

// ─── Faction audit ────────────────────────────────────────────────────────────

async function auditFaction(factionFolder) {
  const name = path.basename(factionFolder);
  const r = {
    faction: name,
    dbMissing: false,
    pdfOperativesFound: 0,
    keywordDiffs: [],
    statDiffs: [],
    weaponDiffs: [],
    inPdfNotDb: [],
    inDbNotPdf: [],
  };

  const datacardPath = path.join(factionFolder, 'Datacard.pdf');
  if (!fs.existsSync(datacardPath)) { r.pdfMissing = true; return r; }

  const pages = await extractPdfPages(datacardPath);
  if (!pages) { r.pdfReadError = true; return r; }

  const pdfOps = parseDatacardPages(pages);
  r.pdfOperativesFound = pdfOps.length;

  const dbFaction = getDbFaction(name);
  if (!dbFaction) { r.dbMissing = true; return r; }

  const dbCards = getDbCards(dbFaction.id);

  for (const po of pdfOps) {
    const dc = dbCards.find(c =>
      norm(c.operative_name).toUpperCase() === norm(po.name).toUpperCase()
    );
    if (!dc) { r.inPdfNotDb.push(po.name); continue; }

    // Keywords
    const dbKw  = normKw(dc.keywords ?? '');
    const pdfKw = normKw(po.keywords);
    if (dbKw !== pdfKw) r.keywordDiffs.push({ operative: dc.operative_name, db: dbKw, pdf: pdfKw });

    // Stats
    const sd = statDiff(JSON.parse(dc.stats_json ?? '{}'), po.stats);
    if (sd.length) r.statDiffs.push({ operative: dc.operative_name, diffs: sd });

    // Weapons
    const wd = weaponDiff(JSON.parse(dc.weapons_json ?? '[]'), po.weapons);
    if (wd.length) r.weaponDiffs.push({ operative: dc.operative_name, diffs: wd });
  }

  for (const dc of dbCards) {
    const found = pdfOps.find(p =>
      norm(p.name).toUpperCase() === norm(dc.operative_name).toUpperCase()
    );
    if (!found) r.inDbNotPdf.push(dc.operative_name);
  }

  return r;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Kill Team Vault – PDF Audit\n');

  const factionFolders = fs.readdirSync(PDF_BASE)
    .filter(f => !SKIP_FOLDERS.has(f))
    .map(f => path.join(PDF_BASE, f))
    .filter(f => fs.statSync(f).isDirectory())
    .sort();

  console.log(`Auditing ${factionFolders.length} factions...\n`);

  const allResults = [];
  for (const folder of factionFolders) {
    const name = path.basename(folder);
    process.stdout.write(`  ${name.padEnd(40)}`);
    const r = await auditFaction(folder);
    const issues = r.keywordDiffs.length + r.statDiffs.length +
      r.weaponDiffs.length + r.inPdfNotDb.length + r.inDbNotPdf.length +
      (r.dbMissing ? 1 : 0) + (r.pdfMissing ? 1 : 0);
    const parsed = r.pdfOperativesFound;
    console.log(`parsed=${parsed}  issues=${issues || 'none'}`);
    allResults.push(r);
  }

  // ── Raw JSON ───────────────────────────────────────────────────────────────
  fs.writeFileSync(RAW_OUT, JSON.stringify(allResults, null, 2));

  // ── Text report ────────────────────────────────────────────────────────────
  const lines = [];
  lines.push('KILL TEAM VAULT – PDF AUDIT REPORT');
  lines.push('===================================');
  lines.push(`Generated : ${new Date().toISOString()}`);
  lines.push('');

  let totalIssues = 0;

  for (const r of allResults) {
    const issues = r.keywordDiffs.length + r.statDiffs.length +
      r.weaponDiffs.length + r.inPdfNotDb.length + r.inDbNotPdf.length +
      (r.dbMissing ? 1 : 0);
    if (!issues) continue;
    totalIssues += issues;

    lines.push(`━━━ ${r.faction}  [parsed: ${r.pdfOperativesFound}] ━━━`);
    if (r.dbMissing) lines.push('  [!] Not found in database');

    if (r.keywordDiffs.length) {
      lines.push(`  KEYWORD DIFFS (${r.keywordDiffs.length}):`);
      for (const d of r.keywordDiffs) {
        lines.push(`    ${d.operative}`);
        lines.push(`      DB : ${d.db}`);
        lines.push(`      PDF: ${d.pdf}`);
      }
    }

    if (r.statDiffs.length) {
      lines.push(`  STAT DIFFS (${r.statDiffs.length}):`);
      for (const d of r.statDiffs) {
        lines.push(`    ${d.operative}`);
        for (const s of d.diffs)
          lines.push(`      ${s.stat}: DB="${s.db}"  PDF="${s.pdf}"`);
      }
    }

    if (r.weaponDiffs.length) {
      lines.push(`  WEAPON DIFFS:`);
      for (const wd of r.weaponDiffs) {
        lines.push(`    ${wd.operative}`);
        for (const d of wd.diffs) {
          if (d.type === 'missing') {
            lines.push(`      [MISSING IN DB] ${d.weapon}`);
          } else {
            for (const f of d.fields)
              lines.push(`      ${d.weapon} – ${f.field}: DB="${f.db}"  PDF="${f.pdf}"`);
          }
        }
      }
    }

    if (r.inPdfNotDb.length) {
      lines.push(`  IN PDF BUT NOT IN DB:`);
      r.inPdfNotDb.forEach(n => lines.push(`    - ${n}`));
    }
    if (r.inDbNotPdf.length) {
      lines.push(`  IN DB BUT NOT IN PDF:`);
      r.inDbNotPdf.forEach(n => lines.push(`    - ${n}`));
    }
    lines.push('');
  }

  lines.push('─── SUMMARY ────────────────────────────────────────');
  lines.push(`Factions audited     : ${allResults.length}`);
  lines.push(`Factions with issues : ${allResults.filter(r =>
    r.keywordDiffs.length + r.statDiffs.length + r.weaponDiffs.length +
    r.inPdfNotDb.length + r.inDbNotPdf.length + (r.dbMissing ? 1 : 0) > 0
  ).length}`);
  lines.push(`Total issues         : ${totalIssues}`);

  fs.writeFileSync(REPORT_OUT, lines.join('\n'));
  console.log(`\nReport → ${REPORT_OUT}`);
  console.log(`Raw    → ${RAW_OUT}`);
}

main().catch(e => { console.error(e); process.exit(1); });
