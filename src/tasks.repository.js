const pool = require('./db');

// Acces aux donnees : toute la logique SQL est regroupee ici.
// Le reste de l'app ne connait que ces fonctions, pas les requetes.
const TaskRepository = {
  findAll() {
    return pool.query('SELECT * FROM tasks ORDER BY id').then((r) => r.rows);
  },

  findById(id) {
    return pool.query('SELECT * FROM tasks WHERE id = $1', [id]).then((r) => r.rows[0]);
  },

  create({ title, done = false }) {
    return pool
      .query('INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *', [title, done])
      .then((r) => r.rows[0]);
  },

  update(id, { title, done }) {
    return pool
      .query(
        'UPDATE tasks SET title = COALESCE($1, title), done = COALESCE($2, done) WHERE id = $3 RETURNING *',
        [title ?? null, done ?? null, id]
      )
      .then((r) => r.rows[0]);
  },

  remove(id) {
    return pool.query('DELETE FROM tasks WHERE id = $1', [id]).then((r) => r.rowCount);
  },
};

module.exports = TaskRepository;
