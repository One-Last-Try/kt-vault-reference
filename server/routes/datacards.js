import { Router } from 'express';
import db from '../db/schema.js';

const router = Router();

router.get('/', (req, res) => {
  const { search, category } = req.query;
  let query = `
    SELECT d.*, f.name as faction_name, f.faction_group
    FROM datacards d
    LEFT JOIN factions f ON d.faction_id = f.id
    WHERE 1=1
  `;
  const params = [];

  if (category) {
    query += ' AND f.name = ?';
    params.push(category);
  }
  if (search) {
    query += ' AND (d.operative_name LIKE ? OR d.role LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY f.name, d.operative_name';
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare(`
    SELECT d.*, f.name as faction_name, f.faction_group
    FROM datacards d
    LEFT JOIN factions f ON d.faction_id = f.id
    WHERE d.id = ?
  `).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

export default router;
