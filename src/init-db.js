const fs = require('fs');
const path = require('path');
const pool = require('./db');

// Applique le schema SQL. A lancer une fois apres avoir configure DATABASE_URL.
async function main() {
  const schema = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
  await pool.query(schema);
  console.log('Base initialisee (table tasks prete).');
  await pool.end();
}

main().catch((err) => {
  console.error('Echec init-db :', err.message);
  process.exit(1);
});
