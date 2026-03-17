import { Router } from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import db from '../db/schema.js';
import { requireAdmin } from '../middleware/auth.js';
import { extractText } from '../services/pdfParser.js';
import { processWithAI } from '../services/aiProcessor.js';
import { computeDiff } from '../services/diffEngine.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PENDING_DIR = path.join(__dirname, '..', '..', 'pdf-intake', 'pending');

const router = Router();

// Multer — save uploads to pdf-intake/pending/
const storage = multer.diskStorage({
  destination: PENDING_DIR,
  filename: (req, file, cb) => {
    const ts = Date.now();
    cb(null, `${ts}-${file.originalname}`);
  },
});
const upload = multer({ storage, fileFilter: (req, file, cb) => cb(null, file.mimetype === 'application/pdf') });

// ── POST /api/admin/login ──────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});

// ── POST /api/admin/pdf ────────────────────────────────────────────────────────
router.post('/pdf', requireAdmin, upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No PDF uploaded' });

  const importRow = db.prepare(
    "INSERT INTO pdf_imports (filename, status) VALUES (?, 'processing')"
  ).run(req.file.filename);
  const importId = importRow.lastInsertRowid;

  try {
    const text    = await extractText(req.file.path);
    const aiJson  = await processWithAI(text, req.file.originalname);
    if (!aiJson) throw new Error('AI returned null');

    const diff = computeDiff(aiJson);

    db.prepare("UPDATE pdf_imports SET status = 'pending', diff_json = ? WHERE id = ?")
      .run(JSON.stringify({ aiJson, diff }), importId);

    res.json({ id: importId, diff, aiJson });
  } catch (err) {
    db.prepare("UPDATE pdf_imports SET status = 'error' WHERE id = ?").run(importId);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/admin/pdf/:id/approve ──────────────────────────────────────────
router.post('/pdf/:id/approve', requireAdmin, (req, res) => {
  const row = db.prepare('SELECT * FROM pdf_imports WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Import not found' });
  if (row.status !== 'pending') return res.status(400).json({ error: 'Nothing to approve' });

  const { aiJson, diff } = JSON.parse(row.diff_json);
  const version = aiJson.source ?? 'unknown';
  const now = new Date().toISOString();
  const factions = db.prepare('SELECT * FROM factions').all();

  function factionId(name) {
    if (!name) return null;
    const f = factions.find(f => f.name.toLowerCase() === String(name).toLowerCase());
    return f?.id ?? null;
  }

  const applyAll = db.transaction(() => {
    // Insert new
    for (const item of diff.new) {
      if (item.type === 'rule') {
        db.prepare(
          'INSERT INTO rules (category, title, content, page_ref, version) VALUES (?,?,?,?,?)'
        ).run(item.data.category, item.data.title, item.data.content, item.data.page_ref ?? null, version);
        db.prepare(
          "INSERT INTO changelog (version, change_type, content_type, summary, approved_at) VALUES (?,?,?,?,?)"
        ).run(version, 'added', 'rule', `Added rule: ${item.data.title}`, now);
      }
      if (item.type === 'datacard') {
        const fid = factionId(item.data.faction);
        db.prepare(
          'INSERT INTO datacards (operative_name, faction_id, role, stats_json, weapons_json, abilities_json, version) VALUES (?,?,?,?,?,?,?)'
        ).run(
          item.data.operative_name, fid, item.data.role ?? null,
          JSON.stringify(item.data.stats ?? {}),
          JSON.stringify(item.data.weapons ?? []),
          JSON.stringify(item.data.abilities ?? []),
          version
        );
        db.prepare(
          "INSERT INTO changelog (version, change_type, content_type, summary, approved_at) VALUES (?,?,?,?,?)"
        ).run(version, 'added', 'datacard', `Added operative: ${item.data.operative_name}`, now);
      }
      if (item.type === 'team_rule') {
        const fid = factionId(item.data.faction);
        db.prepare(
          'INSERT INTO team_rules (faction_id, type, name, cost, description, version) VALUES (?,?,?,?,?,?)'
        ).run(fid, item.data.type, item.data.name, item.data.cost ?? 0, item.data.description, version);
        db.prepare(
          "INSERT INTO changelog (version, change_type, content_type, summary, approved_at) VALUES (?,?,?,?,?)"
        ).run(version, 'added', 'team_rule', `Added ${item.data.type}: ${item.data.name}`, now);
      }
    }

    // Update modified
    for (const item of diff.modified) {
      if (item.type === 'rule') {
        db.prepare(
          'UPDATE rules SET category=?, content=?, page_ref=?, version=?, updated_at=? WHERE id=?'
        ).run(item.data.category, item.data.content, item.data.page_ref ?? null, version, now, item.id);
        db.prepare(
          "INSERT INTO changelog (version, change_type, content_type, content_id, summary, detail, approved_at) VALUES (?,?,?,?,?,?,?)"
        ).run(version, 'modified', 'rule', item.id, `Updated rule: ${item.data.title}`, JSON.stringify({ old: item.old, new: item.data }), now);
      }
      if (item.type === 'datacard') {
        db.prepare(
          'UPDATE datacards SET stats_json=?, weapons_json=?, abilities_json=?, version=? WHERE id=?'
        ).run(
          JSON.stringify(item.data.stats ?? {}),
          JSON.stringify(item.data.weapons ?? []),
          JSON.stringify(item.data.abilities ?? []),
          version, item.id
        );
        db.prepare(
          "INSERT INTO changelog (version, change_type, content_type, content_id, summary, detail, approved_at) VALUES (?,?,?,?,?,?,?)"
        ).run(version, 'modified', 'datacard', item.id, `Updated operative: ${item.data.operative_name}`, JSON.stringify({ old: item.old, new: item.data }), now);
      }
      if (item.type === 'team_rule') {
        db.prepare(
          'UPDATE team_rules SET description=?, cost=?, version=? WHERE id=?'
        ).run(item.data.description, item.data.cost ?? 0, version, item.id);
        db.prepare(
          "INSERT INTO changelog (version, change_type, content_type, content_id, summary, detail, approved_at) VALUES (?,?,?,?,?,?,?)"
        ).run(version, 'modified', 'team_rule', item.id, `Updated ${item.data.type}: ${item.data.name}`, JSON.stringify({ old: item.old, new: item.data }), now);
      }
    }

    db.prepare("UPDATE pdf_imports SET status = 'approved' WHERE id = ?").run(row.id);
  });

  try {
    applyAll();
    res.json({ success: true, applied: { new: diff.new.length, modified: diff.modified.length } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/imports ────────────────────────────────────────────────────
router.get('/imports', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT id, filename, status, created_at FROM pdf_imports ORDER BY id DESC').all();
  res.json(rows);
});

// ── GET /api/admin/imports/:id ────────────────────────────────────────────────
router.get('/imports/:id', requireAdmin, (req, res) => {
  const row = db.prepare('SELECT * FROM pdf_imports WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json({ ...row, diff_json: row.diff_json ? JSON.parse(row.diff_json) : null });
});

export default router;
