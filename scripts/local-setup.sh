#!/usr/bin/env bash
# Met en route le POC en LOCAL (a lancer dans VOTRE terminal macOS).
# Utilise le PostgreSQL Homebrew deja installe + l'utilisateur courant (auth trust).
set -e
cd "$(dirname "$0")/.."

DB_URL="postgres://$(whoami)@localhost:5432/cloud_comparison"

echo "1) Demarrage de PostgreSQL 14..."
brew services start postgresql@14

echo "2) Creation de la base 'cloud_comparison'..."
createdb cloud_comparison 2>/dev/null && echo "   -> creee" || echo "   -> existe deja (ok)"

echo "3) Installation des dependances Node..."
npm install --silent

echo "4) Application du schema (table tasks)..."
DATABASE_URL="$DB_URL" npm run init-db

echo
echo "=== Pret ! Lancez l'API avec : ==="
echo "  DATABASE_URL=\"$DB_URL\" npm start"
echo
echo "Puis dans un autre terminal, testez :"
echo "  curl localhost:3000/health"
echo "  curl -X POST localhost:3000/tasks -H 'Content-Type: application/json' -d '{\"title\":\"hello\"}'"
echo "  curl localhost:3000/tasks"
