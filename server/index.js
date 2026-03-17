import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import db from './db/schema.js';
import rulesRouter from './routes/rules.js';
import datacardsRouter from './routes/datacards.js';
import teamsRouter from './routes/teams.js';
import changelogRouter from './routes/changelog.js';
import adminRouter from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/factions', (req, res) => {
  const { group } = req.query;
  let query = 'SELECT * FROM factions WHERE 1=1';
  const params = [];
  if (group) {
    query += ' AND faction_group = ?';
    params.push(group);
  }
  query += ' ORDER BY faction_group, name';
  res.json(db.prepare(query).all(...params));
});

app.use('/api/rules', rulesRouter);
app.use('/api/datacards', datacardsRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/changelog', changelogRouter);
app.use('/api/admin', adminRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
