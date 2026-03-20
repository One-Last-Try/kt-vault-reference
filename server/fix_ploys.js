/**
 * Kill Team Vault – Ploy & Equipment Fixer
 *
 * Reads all faction PDFs from Teams PDFs, extracts ploy and equipment
 * descriptions verbatim, and updates the DB to match.
 *
 * Run from server/:
 *   node fix_ploys.js --dry    (preview)
 *   node fix_ploys.js          (apply)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import db from './db/schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDF_BASE  = 'C:\\Users\\serka\\OneDrive\\Desktop\\Kill Team\\Teams PDFs';
const DRY       = process.argv.includes('--dry');

const SKIP = new Set(['General','Mission Packs','Core_Rules','Errata_FAQ','White_Dwarf','Uncategorised']);

// ─── PDF ─────────────────────────────────────────────────────────────────────

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
  } catch { return null; }
}

// ─── Flavor stripping ─────────────────────────────────────────────────────────
// Each ploy/equipment page: FACTION  TYPE  NAME  Flavor sentence(s).  Rules.
// Rules always start with one of these patterns:

const RULES_START = /^(Select |Whenever |Use this |Add \d|Add 1 |Place |Inflict |Roll |Each time |Until |When a |When an |You can |You cannot |Having |Once per|Once during|If you |After revealing|After you |Before |Doing so|That operative|Friendly |Separately |All friendly|Change your|Grant |Reduce |Remove |Each friendly|Each enemy|Both players|Your opponent|During the |During a |During this|Resolve |This operative|This ploy|During each|At the start|At the end|In the |While |Pick one|Choose one|Note |PSYCHIC\.|SUPPORT\.|STRATEGIC GAMBIT)/;

function stripFlavor(content) {
  content = content.replace(/\s+/g, ' ').trim();
  const parts = content.split(/(?<=\.)\s+(?=[A-Z*•])/);
  for (let i = 0; i < parts.length; i++) {
    if (RULES_START.test(parts[i].trim())) {
      return parts.slice(i).join(' ').replace(/\s+/g, ' ').trim();
    }
  }
  // Fallback: drop first sentence
  const firstDot = content.indexOf('. ');
  return firstDot !== -1 ? content.slice(firstDot + 2).trim() : content.trim();
}

// ─── Parser ───────────────────────────────────────────────────────────────────

function norm(s) {
  return String(s ?? '')
    .replace(/[\u2018\u2019\u02BC\u0060\u00B4']/g, "'")   // all apostrophe variants → '
    .replace(/[\u201C\u201D\u201E\u201F"]/g, '"')          // all double-quote variants → "
    .replace(/\s+/g, ' ')
    .trim();
}

function parseItemPages(pages, typeLabel) {
  const results = [];
  for (const rawPage of pages) {
    const typeRx = new RegExp(typeLabel, 'i');
    const m = rawPage.match(typeRx);
    if (!m) continue;

    const afterType = rawPage.slice(m.index + m[0].length).trim();

    let nameEnd = 0;
    for (let i = 0; i < afterType.length; i++) {
      if (afterType[i] >= 'a' && afterType[i] <= 'z') { nameEnd = i; break; }
    }
    while (nameEnd > 0 && afterType[nameEnd - 1] !== ' ') nameEnd--;
    const name = afterType.slice(0, nameEnd).trim();
    if (!name) continue;

    const description = norm(stripFlavor(afterType.slice(nameEnd).trim()));
    if (!description) continue;

    results.push({ name, description });
  }
  return results;
}

// ─── DB update ────────────────────────────────────────────────────────────────

const updateRule = db.prepare('UPDATE team_rules SET description = ? WHERE id = ?');

async function processFactionFile(factionName, dbFactionId, pdfPath, typeLabel, dbType, dbSubtype) {
  if (!fs.existsSync(pdfPath)) return 0;
  const pages = await extractPdfPages(pdfPath);
  if (!pages) return 0;

  const pdfItems = parseItemPages(pages, typeLabel);
  const dbItems  = db.prepare(
    `SELECT * FROM team_rules WHERE faction_id = ? AND type = ?
     AND (subtype = ? OR (subtype IS NULL AND ? IS NULL))`
  ).all(dbFactionId, dbType, dbSubtype, dbSubtype);

  let fixed = 0;
  for (const pi of pdfItems) {
    const di = dbItems.find(r => norm(r.name).toUpperCase() === pi.name.toUpperCase());
    if (!di) { console.log(`    SKIP (not in DB): ${pi.name}`); continue; }

    const dbDesc  = norm(di.description ?? '');
    if (dbDesc === pi.description) continue;

    const label = dbSubtype ?? dbType;
    console.log(`  FIX [${factionName}] ${pi.name} (${label})`);
    if (!DRY) updateRule.run(pi.description, di.id);
    fixed++;
  }
  return fixed;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Kill Team Vault – Ploy & Equipment Fixer\n');

  const folders = fs.readdirSync(PDF_BASE)
    .filter(f => !SKIP.has(f))
    .map(f => ({ name: f, full: path.join(PDF_BASE, f) }))
    .filter(f => fs.statSync(f.full).isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  let totalFixed = 0, totalSkipped = 0;

  for (const { name, full } of folders) {
    const dbFaction = db.prepare('SELECT * FROM factions WHERE name = ?').get(name);
    if (!dbFaction) { totalSkipped++; continue; }

    let factionFixed = 0;
    factionFixed += await processFactionFile(name, dbFaction.id,
      path.join(full, 'Ploy_Strategic.pdf'), 'STRATEGY PLOY', 'ploy', 'Strategy');
    factionFixed += await processFactionFile(name, dbFaction.id,
      path.join(full, 'Ploy_Firefight.pdf'), 'FIREFIGHT PLOY', 'ploy', 'Firefight');
    factionFixed += await processFactionFile(name, dbFaction.id,
      path.join(full, 'Equipment_Faction.pdf'), 'FACTION EQUIPMENT', 'equipment', null);

    totalFixed += factionFixed;
  }

  console.log('\n─── Summary ────────────────────────────────');
  console.log(`  Fixed   : ${totalFixed}`);
  console.log(`  Skipped : ${totalSkipped} factions not in DB`);
  if (DRY) console.log('\n  DRY RUN — no changes written.');
  else      console.log('\n  Changes written to DB.');
}

main().catch(e => { console.error(e); process.exit(1); });
