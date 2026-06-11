const { Pool } = require('pg');

// Une seule source de connexion pour les 3 deploiements.
// Seule la variable d'environnement DATABASE_URL change selon l'hebergement
// (VM en IaaS, base managee en PaaS/SaaS). Le code applicatif reste identique.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Les bases managees (PaaS/SaaS) exigent souvent du SSL : PGSSL=require
  ssl: process.env.PGSSL === 'require' ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
