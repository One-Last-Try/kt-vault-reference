/**
 * Kill Team Vault – Keyword Fixer
 *
 * Reads audit_raw.json and applies verbatim PDF keywords to the database.
 * Also fixes operative name mismatches where the PDF uses faction-prefixed names.
 *
 * Run from server/:
 *   node fix_keywords.js
 *
 * Dry-run (show changes without applying):
 *   node fix_keywords.js --dry
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db/schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRY = process.argv.includes('--dry');

const raw = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'audit_raw.json'), 'utf8')
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cleanPdfKeywords(pdfKw) {
  // Some pages have ability text bleed in before the keyword line, separated
  // by a period-space: "GAZE OF THE GODS . BLOODED, CHAOS, SHARPSHOOTER"
  // → take everything after the last ". "
  if (pdfKw.includes('. ')) {
    const parts = pdfKw.split('. ');
    pdfKw = parts[parts.length - 1].trim();
  }
  // Normalise apostrophes (T'AU vs T'AU etc.)
  pdfKw = pdfKw.replace(/['']/g, "'");
  return pdfKw;
}

function normForCompare(s) {
  return (s ?? '').toUpperCase()
    .replace(/['']/g, "'")
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isPlausibleKeywords(kw) {
  // Must have at least one comma (multiple keywords)
  if (!kw.includes(',')) return false;
  // Must not start with digits or lowercase
  if (/^[0-9]/.test(kw)) return false;
  return true;
}

// ─── Apply fixes ──────────────────────────────────────────────────────────────

const updateKw = db.prepare(
  'UPDATE datacards SET keywords = ? WHERE id = ?'
);
const updateName = db.prepare(
  'UPDATE datacards SET operative_name = ? WHERE id = ?'
);

let kwFixed    = 0;
let nameFixed  = 0;
let skipped    = 0;

for (const result of raw) {
  const { faction, keywordDiffs = [], inPdfNotDb = [], inDbNotPdf = [] } = result;

  // ── 1. Fix keyword diffs ─────────────────────────────────────────────────
  for (const diff of keywordDiffs) {
    const pdfKw  = cleanPdfKeywords(diff.pdf);
    const dbKw   = normForCompare(diff.db);
    const pdfKwN = normForCompare(pdfKw);

    // Skip if they're actually the same after normalisation
    if (dbKw === pdfKwN) { skipped++; continue; }

    // Skip if PDF keywords don't look plausible (parsing artifact)
    if (!isPlausibleKeywords(pdfKw)) {
      console.log(`  SKIP (implausible) [${faction}] ${diff.operative}: "${pdfKw}"`);
      skipped++; continue;
    }

    // Look up the operative in the DB
    const dbCard = db.prepare(
      "SELECT id FROM datacards WHERE operative_name = ? AND faction_id = (SELECT id FROM factions WHERE name = ?)"
    ).get(diff.operative, faction);

    if (!dbCard) {
      console.log(`  SKIP (not found)   [${faction}] ${diff.operative}`);
      skipped++; continue;
    }

    console.log(`  KW FIX [${faction}] ${diff.operative}`);
    console.log(`    WAS: ${diff.db}`);
    console.log(`    NOW: ${pdfKw}`);

    if (!DRY) updateKw.run(pdfKw, dbCard.id);
    kwFixed++;
  }

  // ── 2. Fix operative name mismatches ────────────────────────────────────
  // Case: PDF extracts "BATTLECLADE TECHNOARCHEOLOGIST" but DB has "TECHNOARCHEOLOGIST"
  // When DB name is a suffix of the PDF name, the real name should be the PDF name.
  for (const pdfName of inPdfNotDb) {
    // Check if any DB "not in PDF" name is a suffix of this PDF name
    const dbMatch = inDbNotPdf.find(dbName => {
      const pN = pdfName.toUpperCase().trim();
      const dN = dbName.toUpperCase().trim();
      return pN === dN || pN.endsWith(' ' + dN) || pN.endsWith(dN);
    });

    if (!dbMatch) continue;

    // Found a prefix mismatch — update the DB operative name to the PDF name
    const dbCard = db.prepare(
      "SELECT id FROM datacards WHERE operative_name = ? AND faction_id = (SELECT id FROM factions WHERE name = ?)"
    ).get(dbMatch, faction);

    if (!dbCard) continue;

    console.log(`  NAME FIX [${faction}] "${dbMatch}" → "${pdfName}"`);
    if (!DRY) updateName.run(pdfName, dbCard.id);
    nameFixed++;
  }
}

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log('');
console.log('─── Summary ──────────────────────────────');
console.log(`  Keywords fixed   : ${kwFixed}`);
console.log(`  Names fixed      : ${nameFixed}`);
console.log(`  Skipped          : ${skipped}`);
if (DRY) console.log('\n  DRY RUN — no changes written to DB');
else      console.log('\n  Changes written to DB.');
