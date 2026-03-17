import { Router } from 'express';
import db from '../db/schema.js';

const router = Router();

router.get('/', (req, res) => {
  const { search, category } = req.query;
  let query = 'SELECT * FROM rules WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (search) {
    query += ' AND (title LIKE ? OR content LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY category, title';
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM rules WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

export default router;
