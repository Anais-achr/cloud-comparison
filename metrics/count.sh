#!/usr/bin/env bash
# Mesures OBJECTIVES de complexite du POC (a reporter dans comparison-template.md).
# Ces chiffres ne dependent pas du developpeur : lignes de code, nb de dependances.
set -e
cd "$(dirname "$0")/.."

echo "== Lignes de code applicatives (src + db) =="
if command -v cloc >/dev/null 2>&1; then
  cloc src db
else
  echo "(cloc non installe -> total des lignes non vides ; 'brew install cloc' pour le detail)"
  total=0
  while IFS= read -r -d '' f; do
    n=$(grep -cve '^[[:space:]]*$' "$f")
    total=$((total + n))
  done < <(find src db -type f \( -name '*.js' -o -name '*.sql' \) -print0)
  echo "$total lignes de code"
fi

echo
echo "== Dependances applicatives (package.json) =="
node -e "const p=require('./package.json');const d=Object.keys(p.dependencies||{});console.log(d.length+' dependance(s) : '+d.join(', '))"
