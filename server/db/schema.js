import { createRequire } from 'module';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { seed } from './seed.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH   = join(__dirname, '..', 'ktref.sqlite');

// Use createRequire so the CJS sql.js package works inside ESM
const require       = createRequire(import.meta.url);
const initSqlJs     = require('sql.js');
const sqlJsDistDir  = dirname(require.resolve('sql.js'));

// ── Wrapper: mimic better-sqlite3 API so routes need no changes ───────────────

class Statement {
  constructor(db, sql) {
    this._db  = db;
    this._sql = sql;
  }

  all(...args) {
    const params = args.flat();
    const stmt   = this._db._sqlDb.prepare(this._sql);
    if (params.length) stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  }

  get(...args) {
    const params = args.flat();
    const stmt   = this._db._sqlDb.prepare(this._sql);
    if (params.length) stmt.bind(params);
    let row = null;
    if (stmt.step()) row = stmt.getAsObject();
    stmt.free();
    return row;
  }

  run(...args) {
    const params = args.flat();
    this._db._sqlDb.run(this._sql, params.length ? params : []);
    const res            = this._db._sqlDb.exec('SELECT last_insert_rowid()');
    const lastInsertRowid = res[0]?.values[0]?.[0] ?? null;
    const changes         = this._db._sqlDb.getRowsModified();
    if (!this._db._inTransaction) this._db._persist();
    return { lastInsertRowid, changes };
  }
}

class Database {
  constructor(sqlDb, dbPath) {
    this._sqlDb         = sqlDb;
    this._path          = dbPath;
    this._inTransaction = false;
  }

  prepare(sql) { return new Statement(this, sql); }

  exec(sql) { this._sqlDb.exec(sql); }

  pragma() { /* no-op — not needed with in-memory sql.js */ }

  transaction(fn) {
    return () => {
      this._inTransaction = true;
      this._sqlDb.run('BEGIN');
      try {
        fn();
        this._sqlDb.run('COMMIT');
        this._inTransaction = false;
        this._persist();
      } catch (e) {
        try { this._sqlDb.run('ROLLBACK'); } catch {}
        this._inTransaction = false;
        throw e;
      }
    };
  }

  _persist() {
    const data = this._sqlDb.export();
    fs.writeFileSync(this._path, Buffer.from(data));
  }
}

// ── Init (top-level await — ESM only, no changes needed in routes) ────────────

const SQL = await initSqlJs({ locateFile: file => join(sqlJsDistDir, file) });

const sqlDb = fs.existsSync(DB_PATH)
  ? new SQL.Database(fs.readFileSync(DB_PATH))
  : new SQL.Database();

const db = new Database(sqlDb, DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS factions (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL UNIQUE,
    faction_group TEXT NOT NULL,
    icon_url      TEXT
  );

  CREATE TABLE IF NOT EXISTS rules (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    category   TEXT NOT NULL,
    title      TEXT NOT NULL,
    content    TEXT NOT NULL,
    page_ref   TEXT,
    version    TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS datacards (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    operative_name TEXT NOT NULL,
    faction_id     INTEGER REFERENCES factions(id),
    role           TEXT,
    stats_json     TEXT,
    weapons_json   TEXT,
    abilities_json TEXT,
    version        TEXT
  );

  CREATE TABLE IF NOT EXISTS team_rules (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    faction_id  INTEGER REFERENCES factions(id),
    type        TEXT NOT NULL,
    name        TEXT NOT NULL,
    cost        INTEGER DEFAULT 0,
    description TEXT,
    version     TEXT
  );

  CREATE TABLE IF NOT EXISTS changelog (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    version      TEXT NOT NULL,
    source_pdf   TEXT,
    change_type  TEXT,
    content_type TEXT,
    content_id   INTEGER,
    summary      TEXT,
    detail       TEXT,
    approved_at  TEXT
  );

  CREATE TABLE IF NOT EXISTS pdf_imports (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    filename   TEXT NOT NULL,
    status     TEXT DEFAULT 'pending',
    diff_json  TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

seed(db);

export default db;
