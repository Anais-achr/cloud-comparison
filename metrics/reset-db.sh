#!/usr/bin/env bash
# Remet la base dans le MEME etat de depart avant chaque mesure (table tasks vide).
# Indispensable pour comparer les 3 deploiements dans des conditions equivalentes.
#
# Usage :
#   # En local (PostgreSQL Homebrew, utilisateur courant) :
#   bash metrics/reset-db.sh
#
#   # Sur un deploiement distant (PaaS/SaaS/IaaS) :
#   DATABASE_URL="postgres://user:pwd@host:5432/db" bash metrics/reset-db.sh
set -e

DB_URL="${DATABASE_URL:-postgres://$(whoami)@localhost:5432/cloud_comparison}"

echo "Reset de la table 'tasks' sur : ${DB_URL%%\?*}"
psql "$DB_URL" -c "TRUNCATE tasks RESTART IDENTITY;"
echo "Table 'tasks' videe (ids repartent a 1). Pret pour une mesure propre."
