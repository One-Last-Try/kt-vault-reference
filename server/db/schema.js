import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'ktref.sqlite');

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS factions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE,
    faction_group TEXT NOT NULL,
    icon_url    TEXT
  );

  CREATE TABLE IF NOT EXISTS rules (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    category    TEXT NOT NULL,
    title       TEXT NOT NULL,
    content     TEXT NOT NULL,
    page_ref    TEXT,
    version     TEXT,
    created_at  TEXT DEFAULT (datetime('now')),
    updated_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS datacards (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    operative_name  TEXT NOT NULL,
    faction_id      INTEGER REFERENCES factions(id),
    role            TEXT,
    stats_json      TEXT,
    weapons_json    TEXT,
    abilities_json  TEXT,
    version         TEXT
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
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    filename    TEXT NOT NULL,
    status      TEXT DEFAULT 'pending',
    diff_json   TEXT,
    created_at  TEXT DEFAULT (datetime('now'))
  );
`);

export default db;
