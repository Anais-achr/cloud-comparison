#!/usr/bin/env bash
# Mesure le "cold start" : latence de la 1ere requete apres une periode d'inactivite.
# Tres revelateur : un PaaS gratuit (Render...) s'endort et met plusieurs secondes a
# repondre a la 1ere requete, alors qu'une VM IaaS reste toujours active.
#
# Usage :
#   BASE_URL=https://mon-app.onrender.com bash metrics/cold-start.sh
#
# Pour un cold start realiste : laisser le service inactif ~15 min avant de lancer.
set -e
BASE="${BASE_URL:-http://localhost:3000}"
FMT='temps total: %{time_total}s | TTFB: %{time_starttransfer}s | code HTTP: %{http_code}\n'

echo "Cible : $BASE/health"
echo
echo "== Requete 1 (cold start potentiel) =="
curl -s -o /dev/null -w "$FMT" "$BASE/health"

echo
echo "== Requetes suivantes (warm, pour comparaison) =="
for i in 2 3 4; do
  printf "  req %s -> " "$i"
  curl -s -o /dev/null -w "$FMT" "$BASE/health"
done
