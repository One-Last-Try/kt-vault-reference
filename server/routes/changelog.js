import { Router } from 'express';
import db from '../db/schema.js';

const router = Router();

router.get('/', (req, res) => {
  const { search, category } = req.query;
  let query = 'SELECT * FROM changelog WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND change_type = ?';
    params.push(category);
  }
  if (search) {
    query += ' AND (summary LIKE ? OR detail LIKE ? OR version LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY approved_at DESC, id DESC';
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM changelog WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

export default router;
