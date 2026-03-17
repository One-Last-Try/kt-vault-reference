// Run once locally: node server/db/export_seed.js
// Reads ktref.sqlite and writes server/db/seed.js

import { createRequire } from 'module';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require       = createRequire(import.meta.url);
const initSqlJs     = require('sql.js');
const sqlJsDistDir  = dirname(require.resolve('sql.js'));

const SQL = await initSqlJs({ locateFile: f => join(sqlJsDistDir, f) });
const db  = new SQL.Database(fs.readFileSync(join(__dirname, '..', 'ktref.sqlite')));

function all(sql) {
  const res = db.exec(sql);
  if (!res.length) return [];
  const { columns, values } = res[0];
  return values.map(row => Object.fromEntries(columns.map((c, i) => [c, row[i]])));
}

const factions  = all('SELECT * FROM factions  ORDER BY id');
const rules     = all('SELECT * FROM rules      ORDER BY id');
const teamRules = all('SELECT * FROM team_rules ORDER BY id');
const datacards = all('SELECT * FROM datacards  ORDER BY id');

console.log(`Exporting: ${factions.length} factions, ${rules.length} rules, ${teamRules.length} team_rules, ${datacards.length} datacards`);

const out = `// Auto-generated — do not edit manually.
// Regenerate with: node server/db/export_seed.js
// Generated: ${new Date().toISOString()}

const FACTIONS  = ${JSON.stringify(factions,  null, 2)};
const RULES     = ${JSON.stringify(rules,     null, 2)};
const TEAM_RULES= ${JSON.stringify(teamRules, null, 2)};
const DATACARDS = ${JSON.stringify(datacards, null, 2)};

export function seed(db) {
  const { c } = db.prepare('SELECT count(*) as c FROM factions').get();
  if (c > 0) return;

  console.log('[seed] Seeding database from seed.js...');

  // Wrap everything in one transaction for speed
  const run = db.transaction(() => {
    for (const f of FACTIONS) {
      db.prepare(
        'INSERT OR IGNORE INTO factions (id, name, faction_group, icon_url) VALUES (?,?,?,?)'
      ).run(f.id, f.name, f.faction_group, f.icon_url ?? null);
    }

    for (const r of RULES) {
      db.prepare(
        'INSERT OR IGNORE INTO rules (id, category, title, content, page_ref, version, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)'
      ).run(r.id, r.category, r.title, r.content, r.page_ref ?? null, r.version ?? null, r.created_at ?? null, r.updated_at ?? null);
    }

    for (const t of TEAM_RULES) {
      db.prepare(
        'INSERT OR IGNORE INTO team_rules (id, faction_id, type, name, cost, description, version) VALUES (?,?,?,?,?,?,?)'
      ).run(t.id, t.faction_id ?? null, t.type, t.name, t.cost ?? 0, t.description ?? null, t.version ?? null);
    }

    for (const d of DATACARDS) {
      db.prepare(
        'INSERT OR IGNORE INTO datacards (id, operative_name, faction_id, role, stats_json, weapons_json, abilities_json, version) VALUES (?,?,?,?,?,?,?,?)'
      ).run(d.id, d.operative_name, d.faction_id ?? null, d.role ?? null, d.stats_json ?? null, d.weapons_json ?? null, d.abilities_json ?? null, d.version ?? null);
    }
  });

  run();
  console.log(\`[seed] Done — \${FACTIONS.length} factions, \${RULES.length} rules, \${TEAM_RULES.length} team_rules, \${DATACARDS.length} datacards\`);
}
`;

const outPath = join(__dirname, 'seed.js');
fs.writeFileSync(outPath, out, 'utf8');
console.log(`Written to ${outPath}`);
