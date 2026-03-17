import { Router } from 'express';
import db from '../db/schema.js';

const router = Router();

router.get('/', (req, res) => {
  const { search, category } = req.query;
  let query = `
    SELECT t.*, f.name as faction_name, f.faction_group
    FROM team_rules t
    LEFT JOIN factions f ON t.faction_id = f.id
    WHERE 1=1
  `;
  const params = [];

  if (category) {
    query += ' AND t.type = ?';
    params.push(category);
  }
  if (search) {
    query += ' AND (t.name LIKE ? OR t.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY f.name, t.type, t.name';
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

router.get('/factions', (req, res) => {
  const rows = db.prepare('SELECT * FROM factions ORDER BY faction_group, name').all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare(`
    SELECT t.*, f.name as faction_name, f.faction_group
    FROM team_rules t
    LEFT JOIN factions f ON t.faction_id = f.id
    WHERE t.id = ?
  `).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

export default router;
