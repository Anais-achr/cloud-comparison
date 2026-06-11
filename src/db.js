const { Pool } = require('pg');

// Une seule source de connexion pour les 3 deploiements.
// Seule la variable d'environnement DATABASE_URL change selon l'hebergement.
function useSsl(url) {
  if (!url) return false;
  // Railway interne : pas de SSL
  if (url.includes('.railway.internal')) return false;
  if (process.env.PGSSL === 'require') return true;
  // Hotes externes connus (Render, Supabase, Railway public proxy)
  return /\.supabase\.co|\.render\.com|\.rlwy\.net/.test(url);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl(process.env.DATABASE_URL) ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
