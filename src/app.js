const express = require('express');
const pool = require('./db');
const tasksRouter = require('./tasks.routes');

const app = express();
app.use(express.json());

// Sonde de sante : verifie que l'app ET la base repondent
app.get('/health', async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    next(err);
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
