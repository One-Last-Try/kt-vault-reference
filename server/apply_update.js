/**
 * Kill Team Vault – Update Pipeline
 *
 * Reads updated PDFs from the Latest Update folder, diffs them against the
 * current database, applies all changes, and writes changelog entries.
 *
 * Handles:
 *   Datacard.pdf          → operative keywords, stats, weapons
 *   Ploy_Strategic.pdf    → strategy ploy descriptions
 *   Ploy_Firefight.pdf    → firefight ploy descriptions
 *   Equipment_Faction.pdf → faction equipment descriptions
 *
 * Folder structure expected (mirrors Teams PDFs):
 *   Latest Update\
 *     FactionName\
 *       Datacard.pdf
 *       Ploy_Strategic.pdf
 *       Ploy_Firefight.pdf
 *       Equipment_Faction.pdf
 *
 * Run from server/:
 *   node apply_update.js                          (apply changes)
 *   node apply_update.js --dry                    (preview only)
 *   node apply_update.js --version "2025-Q2"      (set version label)
 *
 * After running: git add server/ktref.sqlite && git commit && git push
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import db from './db/schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const UPDATE_BASE = 'C:\\Users\\serka\\OneDrive\\Desktop\\Kill Team\\Lates Update';
const DRY        = process.argv.includes('--dry');

const versionIdx = process.argv.indexOf('--version');
const VERSION = versionIdx !== -1 && process.argv[versionIdx + 1]
  ? process.argv[versionIdx + 1]
  : new Date().toISOString().slice(0, 10);

const TODAY = new Date().toISOString().slice(0, 10);

// ─── PDF helpers ──────────────────────────────────────────────────────────────

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

// ─── Normalisation ────────────────────────────────────────────────────────────

function norm(s) {
  return String(s ?? '')
    .replace(/[\u2018\u2019\u02BC\u0060\u00B4']/g, "'")   // all apostrophe variants → '
    .replace(/[\u201C\u201D\u201E\u201F"]/g, '"')          // all double-quote variants → "
    .replace(/\s+/g, ' ')
    .trim();
}

function normKw(s) {
  return norm(s).toUpperCase().replace(/\s*,\s*/g, ', ');
}

// ─── Flavor text stripper ────────────────────────────────────────────────────
// Ploy/equipment PDFs have: NAME  Flavor sentence(s).  Rules text.
// Rules text always starts with a game-mechanics phrase.
// We strip the flavor to get just the rules for DB comparison.

// Rules text always starts with a game-mechanics phrase.
// Deliberately excludes "The " since flavor sentences often start with it too.
const RULES_START = /^(Select |Whenever |Use this |Add \d|Add 1 |Place |Inflict |Roll |Each time |Until |When a |When an |You can |You cannot |Having |Once per|Once during|If you |After revealing|After you |Before |Doing so|That operative|Friendly |Separately |All friendly)/;

function stripFlavor(content) {
  // Normalize spacing first (pdfjs emits extra spaces around styled text runs)
  content = content.replace(/\s+/g, ' ').trim();

  // Split into sentences on '. ' or '.  ' followed by an uppercase letter
  const parts = content.split(/(?<=\.)\s+(?=[A-Z*•])/);

  for (let i = 0; i < parts.length; i++) {
    if (RULES_START.test(parts[i].trim())) {
      return parts.slice(i).join(' ').replace(/\s+/g, ' ').trim();
    }
  }

  // Fallback: drop the first sentence (always flavor) and return the rest.
  // Handles short rules like "The Reward Earned ploy costs you 0CP."
  const firstDot = content.indexOf('. ');
  return firstDot !== -1 ? content.slice(firstDot + 2).trim() : content.trim();
}

// ─── Ploy / Equipment PDF parser ──────────────────────────────────────────────
// Each page = one ploy or one equipment item.
// Format: "FACTION_NAME  {STRATEGY|FIREFIGHT} PLOY  ITEM_NAME  Flavor.  Rules."
//       or "FACTION_NAME  FACTION EQUIPMENT  ITEM_NAME  Flavor.  Rules."

function parseItemPages(pages, typeLabel) {
  const results = [];

  for (const rawPage of pages) {
    const typeRx = new RegExp(typeLabel, 'i');
    const m = rawPage.match(typeRx);
    if (!m) continue;

    const afterType = rawPage.slice(m.index + m[0].length).trim();

    // Name: everything in ALL CAPS / digits / spaces / hyphens before first lowercase char
    let nameEnd = 0;
    for (let i = 0; i < afterType.length; i++) {
      if (afterType[i] >= 'a' && afterType[i] <= 'z') { nameEnd = i; break; }
    }
    // Back up to last word boundary
    while (nameEnd > 0 && afterType[nameEnd - 1] !== ' ') nameEnd--;
    const name = afterType.slice(0, nameEnd).trim();
    if (!name) continue;

    const content    = afterType.slice(nameEnd).trim();
    const description = stripFlavor(content);

    results.push({ name, description });
  }

  return results;
}

// ─── Changelog ───────────────────────────────────────────────────────────────

const insertChangelog = db.prepare(
  `INSERT INTO changelog
     (version, source_pdf, change_type, content_type, content_id, summary, detail, approved_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
);

function logChange(sourcePdf, changeType, contentType, contentId, summary, oldVal, newVal) {
  console.log(`    [${changeType.toUpperCase()}] ${summary}`);
  if (!DRY) {
    insertChangelog.run(
      VERSION, sourcePdf, changeType, contentType, contentId,
      summary, JSON.stringify({ old: oldVal, new: newVal }), TODAY
    );
  }
}

// ─── DB update statements ─────────────────────────────────────────────────────

const updateKw       = db.prepare('UPDATE datacards SET keywords = ? WHERE id = ?');
const updateStat     = db.prepare('UPDATE datacards SET stats_json = ? WHERE id = ?');
const updateWpn      = db.prepare('UPDATE datacards SET weapons_json = ? WHERE id = ?');
const updateTeamRule = db.prepare('UPDATE team_rules SET description = ? WHERE id = ?');

// ─── Datacard processing ──────────────────────────────────────────────────────

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

      let lastLowerIdx = -1;
      for (let i = before.length - 1; i >= 0; i--) {
        if (before[i] >= 'a' && before[i] <= 'z') { lastLowerIdx = i; break; }
      }
      const allCaps = (lastLowerIdx === -1 ? before : before.slice(lastLowerIdx + 1)).trim();
      if (!allCaps || !allCaps.includes(',')) continue;

      const lastDoubleSpace = allCaps.lastIndexOf('  ');
      if (lastDoubleSpace === -1) continue;
      const kwRaw  = allCaps.slice(0, lastDoubleSpace);
      const opName = allCaps.slice(lastDoubleSpace).trim();
      if (!opName) continue;

      const kwStart = kwRaw.search(/[A-Z]{2,}/);
      if (kwStart === -1) continue;
      const keywords = kwRaw.slice(kwStart)
        .replace(/\s{2,},\s*/g, ', ')
        .replace(/,\s*/g, ', ')
        .trim();

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

async function processDatacard(factionFolder, factionName, dbFaction, dbCards) {
  const filePath = path.join(factionFolder, 'Datacard.pdf');
  if (!fs.existsSync(filePath)) return 0;

  const pages = await extractPdfPages(filePath);
  if (!pages) { console.log('    [ERROR] Could not read Datacard.pdf'); return 0; }

  const pdfOps   = parseDatacardPages(pages);
  const sourcePdf = `${factionName}/Datacard.pdf`;
  let changed = 0;

  for (const po of pdfOps) {
    const dc = dbCards.find(c =>
      norm(c.operative_name).toUpperCase() === norm(po.name).toUpperCase()
    );
    if (!dc) { console.log(`    [NOT IN DB] ${po.name}`); continue; }

    // Keywords
    const dbKw  = normKw(dc.keywords ?? '');
    const pdfKw = normKw(po.keywords);
    if (dbKw !== pdfKw) {
      logChange(sourcePdf, 'modified', 'datacard', dc.id,
        `[${factionName}] ${dc.operative_name} — keywords`, dc.keywords, po.keywords);
      if (!DRY) updateKw.run(po.keywords, dc.id);
      changed++;
    }

    // Stats
    let dbStats;
    try { dbStats = JSON.parse(dc.stats_json ?? '{}'); } catch { dbStats = {}; }
    const newStats = { ...dbStats };
    let statChanged = false;
    for (const k of ['APL', 'MOVE', 'SAVE', 'WOUNDS']) {
      const d = norm(dbStats[k] ?? '').replace(/[""]/g, '"');
      const p = norm(po.stats[k] ?? '').replace(/[""]/g, '"');
      if (d && p && d !== p) {
        logChange(sourcePdf, 'modified', 'datacard', dc.id,
          `[${factionName}] ${dc.operative_name} — ${k}: ${d} → ${p}`, `${k}: ${d}`, `${k}: ${p}`);
        newStats[k] = po.stats[k];
        statChanged = true;
        changed++;
      }
    }
    if (statChanged && !DRY) updateStat.run(JSON.stringify(newStats), dc.id);

    // Weapons
    let dbWeapons;
    try { dbWeapons = JSON.parse(dc.weapons_json ?? '[]'); } catch { dbWeapons = []; }
    const newWeapons  = dbWeapons.map(w => ({ ...w }));
    let weaponChanged = false;

    for (const pw of po.weapons) {
      const dwIdx = newWeapons.findIndex(w =>
        norm(w.name).toLowerCase() === norm(pw.name).toLowerCase()
      );
      if (dwIdx === -1) {
        logChange(sourcePdf, 'added', 'datacard', dc.id,
          `[${factionName}] ${dc.operative_name} — new weapon: ${pw.name}`, null, pw);
        newWeapons.push(pw);
        weaponChanged = true; changed++;
        continue;
      }
      const dw = newWeapons[dwIdx];
      let fieldChanged = false;
      for (const k of ['atk', 'hit', 'dmg']) {
        if (norm(dw[k]) !== norm(pw[k])) {
          logChange(sourcePdf, 'modified', 'datacard', dc.id,
            `[${factionName}] ${dc.operative_name} — ${pw.name} ${k}: ${norm(dw[k])} → ${norm(pw[k])}`,
            `${pw.name} ${k}: ${norm(dw[k])}`, `${pw.name} ${k}: ${norm(pw[k])}`);
          fieldChanged = true; changed++;
        }
      }
      const dwr = norm(dw.wr ?? '').replace(/^-$/, '–');
      const pwr = norm(pw.wr).replace(/^-$/, '–');
      if (dwr !== pwr) {
        logChange(sourcePdf, 'modified', 'datacard', dc.id,
          `[${factionName}] ${dc.operative_name} — ${pw.name} WR: "${dwr}" → "${pwr}"`,
          `${pw.name} WR: ${dwr}`, `${pw.name} WR: ${pwr}`);
        fieldChanged = true; changed++;
      }
      if (fieldChanged) {
        Object.assign(newWeapons[dwIdx], { atk: pw.atk, hit: pw.hit, dmg: pw.dmg, wr: pw.wr });
        weaponChanged = true;
      }
    }
    if (weaponChanged && !DRY) updateWpn.run(JSON.stringify(newWeapons), dc.id);
  }

  return changed;
}

// ─── Ploy / Equipment processing ─────────────────────────────────────────────

async function processTeamRuleFile(factionFolder, factionName, dbFactionId, dbRuleType, dbSubtype, pdfFilename, pdfTypeLabel) {
  const filePath = path.join(factionFolder, pdfFilename);
  if (!fs.existsSync(filePath)) return 0;

  const pages = await extractPdfPages(filePath);
  if (!pages) { console.log(`    [ERROR] Could not read ${pdfFilename}`); return 0; }

  const pdfItems  = parseItemPages(pages, pdfTypeLabel);
  const sourcePdf = `${factionName}/${pdfFilename}`;

  const dbItems = db.prepare(
    `SELECT * FROM team_rules WHERE faction_id = ? AND type = ? AND (subtype = ? OR (subtype IS NULL AND ? IS NULL))`
  ).all(dbFactionId, dbRuleType, dbSubtype, dbSubtype);

  let changed = 0;

  for (const pi of pdfItems) {
    // Find matching DB entry by name (case-insensitive)
    const di = dbItems.find(r => norm(r.name).toUpperCase() === norm(pi.name).toUpperCase());

    if (!di) {
      console.log(`    [NOT IN DB] ${pi.name} — add manually`);
      continue;
    }

    const dbDesc  = norm(di.description ?? '');
    const pdfDesc = norm(pi.description);

    if (dbDesc !== pdfDesc) {
      const typeLabel = dbSubtype ? `${dbSubtype} ploy` : 'equipment';
      logChange(sourcePdf, 'modified', 'team_rule', di.id,
        `[${factionName}] ${pi.name} (${typeLabel}) — description updated`,
        di.description, pdfDesc);
      // Store the normalized description (no double spaces from pdfjs)
      if (!DRY) updateTeamRule.run(pdfDesc, di.id);
      changed++;
    }
  }

  // Flag DB items not found in PDF
  for (const di of dbItems) {
    const found = pdfItems.find(pi => norm(pi.name).toUpperCase() === norm(di.name).toUpperCase());
    if (!found) {
      console.log(`    [IN DB NOT PDF] ${di.name} — check if removed`);
    }
  }

  return changed;
}

// ─── Process one faction folder ───────────────────────────────────────────────

async function processFaction(factionFolder) {
  const factionName = path.basename(factionFolder);

  const dbFaction = db.prepare('SELECT * FROM factions WHERE name = ?').get(factionName);
  if (!dbFaction) {
    console.log(`    [SKIP] "${factionName}" not found in DB`);
    return 0;
  }

  const dbCards = db.prepare('SELECT * FROM datacards WHERE faction_id = ?').all(dbFaction.id);
  let changed = 0;

  // 1. Datacard.pdf → keywords, stats, weapons
  if (fs.existsSync(path.join(factionFolder, 'Datacard.pdf'))) {
    console.log('    Datacard.pdf');
    changed += await processDatacard(factionFolder, factionName, dbFaction, dbCards);
  }

  // 2. Ploy_Strategic.pdf → strategy ploys
  if (fs.existsSync(path.join(factionFolder, 'Ploy_Strategic.pdf'))) {
    console.log('    Ploy_Strategic.pdf');
    changed += await processTeamRuleFile(
      factionFolder, factionName, dbFaction.id,
      'ploy', 'Strategy', 'Ploy_Strategic.pdf', 'STRATEGY PLOY'
    );
  }

  // 3. Ploy_Firefight.pdf → firefight ploys
  if (fs.existsSync(path.join(factionFolder, 'Ploy_Firefight.pdf'))) {
    console.log('    Ploy_Firefight.pdf');
    changed += await processTeamRuleFile(
      factionFolder, factionName, dbFaction.id,
      'ploy', 'Firefight', 'Ploy_Firefight.pdf', 'FIREFIGHT PLOY'
    );
  }

  // 4. Equipment_Faction.pdf → faction equipment
  if (fs.existsSync(path.join(factionFolder, 'Equipment_Faction.pdf'))) {
    console.log('    Equipment_Faction.pdf');
    changed += await processTeamRuleFile(
      factionFolder, factionName, dbFaction.id,
      'equipment', null, 'Equipment_Faction.pdf', 'FACTION EQUIPMENT'
    );
  }

  return changed;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Kill Team Vault – Update Pipeline');
  console.log(`Version : ${VERSION}`);
  console.log(`Mode    : ${DRY ? 'DRY RUN (nothing written)' : 'LIVE'}`);
  console.log('');

  if (!fs.existsSync(UPDATE_BASE)) {
    console.error(`Update folder not found: ${UPDATE_BASE}`);
    process.exit(1);
  }

  const entries = fs.readdirSync(UPDATE_BASE)
    .map(f => path.join(UPDATE_BASE, f))
    .filter(f => fs.statSync(f).isDirectory())
    .sort();

  if (!entries.length) {
    console.log('No faction folders found in the update directory.');
    console.log(`Place faction subfolders containing updated PDFs into:\n  ${UPDATE_BASE}`);
    process.exit(0);
  }

  console.log(`Found ${entries.length} faction folder(s):\n`);

  let totalChanged = 0;

  for (const folder of entries) {
    const name = path.basename(folder);
    console.log(`── ${name}`);
    const changed = await processFaction(folder);
    totalChanged += changed;
    if (changed === 0) console.log('    No changes detected.');
    console.log('');
  }

  console.log('─── Summary ───────────────────────────────────────');
  console.log(`  Total changes : ${totalChanged}`);
  console.log(`  Version       : ${VERSION}`);
  if (DRY) {
    console.log('\n  DRY RUN — nothing written. Remove --dry to apply.');
  } else {
    console.log('\n  Written to DB. Run:');
    console.log('    git add server/ktref.sqlite');
    console.log(`    git commit -m "Apply update ${VERSION}"`);
    console.log('    git push');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
