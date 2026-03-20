/**
 * Kill Team Vault – Update Pipeline
 *
 * Reads updated Datacard PDFs from the Latest Update folder, diffs them
 * against the current database, applies all changes, and writes changelog entries.
 *
 * Folder structure expected (mirrors Teams PDFs):
 *   Latest Update/
 *     FactionName/
 *       Datacard.pdf
 *
 * Run from server/:
 *   node apply_update.js                        (apply changes)
 *   node apply_update.js --dry                  (preview only)
 *   node apply_update.js --version "2025-Q1"    (set version label)
 *
 * After running, commit ktref.sqlite and push to deploy.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import db from './db/schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const UPDATE_BASE = 'C:\\Users\\serka\\OneDrive\\Desktop\\Kill Team\\Latest Update';
const DRY        = process.argv.includes('--dry');

// Parse --version "label" from argv
const versionIdx = process.argv.indexOf('--version');
const VERSION = versionIdx !== -1 && process.argv[versionIdx + 1]
  ? process.argv[versionIdx + 1]
  : new Date().toISOString().slice(0, 10);   // default: YYYY-MM-DD

const TODAY = new Date().toISOString().slice(0, 10);

// ─── PDF extraction (same as audit.js) ────────────────────────────────────────

const STATS_RX = /(\d)\s+APL\s+WOUNDS\s+SAVE\s+MOVE\s+([\d"]+)\s+(\d)\s*\+\s+(\d+)/g;

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

      // Weapons
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

// ─── Normalisation helpers ────────────────────────────────────────────────────

function norm(s) {
  return String(s ?? '').replace(/\s+/g, ' ').trim();
}

function normKw(s) {
  return norm(s).toUpperCase()
    .replace(/['']/g, "'")
    .replace(/\s*,\s*/g, ', ');
}

function normStat(s) {
  return norm(s ?? '').replace(/[""]/g, '"');
}

// ─── Changelog writer ─────────────────────────────────────────────────────────

const insertChangelog = db.prepare(
  `INSERT INTO changelog
     (version, source_pdf, change_type, content_type, content_id, summary, detail, approved_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
);

function logChange(sourcePdf, changeType, contentType, contentId, summary, oldVal, newVal) {
  const detail = JSON.stringify({ old: oldVal, new: newVal });
  console.log(`  [${changeType.toUpperCase()}] ${summary}`);
  if (!DRY) {
    insertChangelog.run(VERSION, sourcePdf, changeType, contentType, contentId, summary, detail, TODAY);
  }
}

// ─── DB update helpers ────────────────────────────────────────────────────────

const updateKw   = db.prepare('UPDATE datacards SET keywords = ? WHERE id = ?');
const updateStat = db.prepare('UPDATE datacards SET stats_json = ? WHERE id = ?');
const updateWpn  = db.prepare('UPDATE datacards SET weapons_json = ? WHERE id = ?');

// ─── Process one faction folder ───────────────────────────────────────────────

async function processFaction(factionFolder) {
  const name = path.basename(factionFolder);
  const datacardPath = path.join(factionFolder, 'Datacard.pdf');

  if (!fs.existsSync(datacardPath)) {
    console.log(`  [SKIP] No Datacard.pdf found in ${name}`);
    return { changed: 0, noDb: false };
  }

  const pages = await extractPdfPages(datacardPath);
  if (!pages) {
    console.log(`  [ERROR] Could not read PDF for ${name}`);
    return { changed: 0, noDb: false };
  }

  const dbFaction = db.prepare('SELECT * FROM factions WHERE name = ?').get(name);
  if (!dbFaction) {
    console.log(`  [SKIP] Faction "${name}" not found in DB — add it manually first`);
    return { changed: 0, noDb: true };
  }

  const dbCards  = db.prepare('SELECT * FROM datacards WHERE faction_id = ?').all(dbFaction.id);
  const pdfOps   = parseDatacardPages(pages);
  const sourcePdf = `${name}/Datacard.pdf`;

  let changed = 0;

  for (const po of pdfOps) {
    const dc = dbCards.find(c =>
      norm(c.operative_name).toUpperCase() === norm(po.name).toUpperCase()
    );
    if (!dc) {
      console.log(`    [NOT IN DB] ${po.name} — skipped (add manually)`);
      continue;
    }

    // ── Keywords ──────────────────────────────────────────────────────────────
    const dbKw  = normKw(dc.keywords ?? '');
    const pdfKw = normKw(po.keywords);

    if (dbKw !== pdfKw) {
      const summary = `[${name}] ${dc.operative_name} — keywords updated`;
      logChange(sourcePdf, 'modified', 'datacard', dc.id, summary, dc.keywords, po.keywords);
      if (!DRY) updateKw.run(po.keywords, dc.id);
      changed++;
    }

    // ── Stats ─────────────────────────────────────────────────────────────────
    let dbStats;
    try { dbStats = JSON.parse(dc.stats_json ?? '{}'); } catch { dbStats = {}; }

    const statKeys = ['APL', 'MOVE', 'SAVE', 'WOUNDS'];
    const changedStats = [];
    const newStats = { ...dbStats };

    for (const k of statKeys) {
      const d = normStat(dbStats[k] ?? '');
      const p = normStat(po.stats[k] ?? '');
      if (d && p && d !== p) {
        changedStats.push({ stat: k, old: d, new: p });
        newStats[k] = po.stats[k];
      }
    }

    if (changedStats.length) {
      for (const s of changedStats) {
        const summary = `[${name}] ${dc.operative_name} — ${s.stat} changed: ${s.old} → ${s.new}`;
        logChange(sourcePdf, 'modified', 'datacard', dc.id, summary, `${s.stat}: ${s.old}`, `${s.stat}: ${s.new}`);
      }
      if (!DRY) updateStat.run(JSON.stringify(newStats), dc.id);
      changed++;
    }

    // ── Weapons ───────────────────────────────────────────────────────────────
    let dbWeapons;
    try { dbWeapons = JSON.parse(dc.weapons_json ?? '[]'); } catch { dbWeapons = []; }

    let weaponChanged = false;
    const newWeapons = dbWeapons.map(dw => ({ ...dw }));

    for (const pw of po.weapons) {
      const dwIdx = newWeapons.findIndex(w =>
        norm(w.name).toLowerCase() === norm(pw.name).toLowerCase()
      );

      if (dwIdx === -1) {
        // New weapon not in DB
        const summary = `[${name}] ${dc.operative_name} — new weapon added: ${pw.name}`;
        logChange(sourcePdf, 'added', 'datacard', dc.id, summary, null, pw);
        newWeapons.push(pw);
        weaponChanged = true;
        changed++;
        continue;
      }

      const dw = newWeapons[dwIdx];
      const fieldDiffs = [];
      for (const k of ['atk', 'hit', 'dmg']) {
        if (norm(dw[k]) !== norm(pw[k]))
          fieldDiffs.push({ field: k, old: norm(dw[k]), new: norm(pw[k]) });
      }
      const dwr = norm(dw.wr ?? '').replace(/^-$/, '–');
      const pwr = norm(pw.wr).replace(/^-$/, '–');
      if (dwr !== pwr) fieldDiffs.push({ field: 'wr', old: dwr, new: pwr });

      if (fieldDiffs.length) {
        for (const f of fieldDiffs) {
          const summary = `[${name}] ${dc.operative_name} — ${pw.name} ${f.field}: ${f.old} → ${f.new}`;
          logChange(sourcePdf, 'modified', 'datacard', dc.id, summary, `${pw.name} ${f.field}: ${f.old}`, `${pw.name} ${f.field}: ${f.new}`);
        }
        Object.assign(newWeapons[dwIdx], {
          atk: pw.atk, hit: pw.hit, dmg: pw.dmg, wr: pw.wr,
        });
        weaponChanged = true;
        changed++;
      }
    }

    if (weaponChanged && !DRY) {
      updateWpn.run(JSON.stringify(newWeapons), dc.id);
    }
  }

  return { changed, noDb: false };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Kill Team Vault – Update Pipeline');
  console.log(`Version label : ${VERSION}`);
  console.log(`Mode          : ${DRY ? 'DRY RUN (no changes written)' : 'LIVE'}`);
  console.log('');

  if (!fs.existsSync(UPDATE_BASE)) {
    console.error(`Update folder not found: ${UPDATE_BASE}`);
    console.error('Create the folder and place faction subfolders with Datacard.pdf inside.');
    process.exit(1);
  }

  const entries = fs.readdirSync(UPDATE_BASE)
    .map(f => path.join(UPDATE_BASE, f))
    .filter(f => fs.statSync(f).isDirectory())
    .sort();

  if (!entries.length) {
    console.log('No faction folders found in the update directory.');
    console.log(`Expected: ${UPDATE_BASE}\\FactionName\\Datacard.pdf`);
    process.exit(0);
  }

  console.log(`Found ${entries.length} faction folder(s) to process:\n`);

  let totalChanged = 0;

  for (const folder of entries) {
    const name = path.basename(folder);
    console.log(`── ${name}`);
    const { changed } = await processFaction(folder);
    totalChanged += changed;
    if (changed === 0) console.log('  No changes detected.');
    console.log('');
  }

  console.log('─── Summary ──────────────────────────────────────');
  console.log(`  Total changes : ${totalChanged}`);
  console.log(`  Version label : ${VERSION}`);
  if (DRY) {
    console.log('\n  DRY RUN — nothing written. Re-run without --dry to apply.');
  } else {
    console.log('\n  Changes written to DB and changelog.');
    console.log('  Next: commit ktref.sqlite and push to deploy.');
    console.log('    git add server/ktref.sqlite');
    console.log(`    git commit -m "Apply update ${VERSION}"`);
    console.log('    git push');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
