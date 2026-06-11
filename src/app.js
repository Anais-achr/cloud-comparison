const express = require('express');
const pool = require('./db');
const tasksRouter = require('./tasks.routes');

const app = express();
app.use(express.json());

// Sonde de sante : verifie que l'app ET la base repondent
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('health/db:', err);
    let dbHost = 'non-defini';
    try {
      dbHost = new URL(process.env.DATABASE_URL || '').hostname;
    } catch (_) {
      dbHost = 'url-invalide';
    }
    res.status(500).json({
      status: 'error',
      message: err.message || String(err),
      code: err.code,
      dbHost,
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    });
  }
});

app.use('/tasks', tasksRouter);

// Middleware d'erreur centralise (toutes les routes y aboutissent)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API CRUD a l'ecoute sur le port ${port}`));

module.exports = app;
