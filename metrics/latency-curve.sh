#!/usr/bin/env bash
# Rejoue le MEME test de charge a 10, 50 puis 100 VUs.
# Permet de tracer la courbe "latence p95 vs concurrence" => objective la
# reaction sous charge (bien plus parlant qu'un seul chiffre).
#
# Usage :
#   BASE_URL=http://IP_OU_DOMAINE MODEL=iaas bash metrics/latency-curve.sh
#
# Genere un fichier metrics/results-<model>-<vus>vus.json par palier.
set -e
cd "$(dirname "$0")/.."
BASE="${BASE_URL:?Definir BASE_URL, ex: BASE_URL=http://IP MODEL=iaas bash metrics/latency-curve.sh}"
MODEL="${MODEL:-modele}"

for vus in 10 50 100; do
  echo "================ $MODEL : $vus VUs ================"
  # Conditions equivalentes : on repart d'une base vide avant CHAQUE palier
  # (sinon la table grossit et le payload de GET /tasks fausse la latence).
  bash metrics/reset-db.sh
  k6 run -e BASE_URL="$BASE" -e VUS="$vus" \
    --summary-export="metrics/results-${MODEL}-${vus}vus.json" \
    load-test/crud-test.js
done

echo
echo "Termine. Relever 'http_req_duration p(95)' de chaque fichier results-${MODEL}-*vus.json."
