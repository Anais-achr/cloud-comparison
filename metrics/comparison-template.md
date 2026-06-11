# Tableau comparatif IaaS / PaaS / SaaS

> A remplir apres avoir deploye les 3 versions et lance le MEME test de charge.
> Conditions equivalentes : meme app, meme script k6, memes VUs, meme region si possible.
>
> Colonne "Source" = comment la metrique est obtenue, du plus automatique au moins :
>   [k6]   = sortie automatique de k6 (aucune intervention)
>   [auto] = script / commande qui mesure tout seul (curl, top, cloc...)
>   [count]= comptage factuel (nb d'etapes, de fichiers, de lignes) — non discutable
>   [bin]  = binaire oui/non (capacite presente ou pas)

## Conditions de l'experience
- Application : API CRUD `tasks` (5 endpoints), identique pour les 3
- Script de charge : `load-test/crud-test.js`
- Parametres : `VUS = ____`, palier `____` s, region `____`

---

## Performance

| Metrique | Source | IaaS | PaaS | SaaS |
|---|---|---|---|---|
| Temps de reponse moyen (ms) `http_req_duration avg` | [k6] | | | |
| Mediane p50 (ms) | [k6] | | | |
| p95 (ms) | [k6] | | | |
| p99 (ms) | [k6] | | | |
| Plus lent / max (ms) | [k6] | | | |
| Time To First Byte `http_req_waiting avg` (ms) | [k6] | | | |
| Debit (req/s) `http_reqs` | [k6] | | | |
| Taux d'erreurs sous charge (%) `http_req_failed` | [k6] | | | |
| **Cold start** : latence 1ere requete apres inactivite (ms) | [auto] `metrics/cold-start.sh` | | | |
| Reaction sous charge — courbe latence p95 vs concurrence (voir bloc dedie) | [k6] | | | |

### Courbe latence vs concurrence (objective la "reaction sous charge")
Relancer le meme script a plusieurs niveaux de VUs et noter le p95 :

| VUs | IaaS p95 (ms) | PaaS p95 (ms) | SaaS p95 (ms) |
|---|---|---|---|
| 10 | | | |
| 50 | | | |
| 100 | | | |

---

## Deploiement

| Metrique | Source | IaaS | PaaS | SaaS |
|---|---|---|---|---|
| Nb de commandes / etapes (zero -> en ligne) | [count] | | | |
| Nb d'actions manuelles distinctes (commandes + clics UI) | [count] | | | |
| Nb de fichiers de configuration crees | [count] | | | |
| Nb d'outils CLI requis (ssh, psql, gcloud, git...) | [count] | | | |
| Duree de build reportee par la plateforme (s) | [auto] (logs plateforme) | | | |

---

## Complexite (volumetries non discutables)

| Metrique | Source | IaaS | PaaS | SaaS |
|---|---|---|---|---|
| Lignes de code applicatives ecrites par vous | [auto] `metrics/count.sh` | | | |
| Lignes de config / infra ecrites (Dockerfile, systemd, nginx, yaml...) | [count] | | | |
| Nb de dependances logicielles (npm) | [auto] `metrics/count.sh` | | | |
| Nb de dependances systeme installees soi-meme (node, postgres, nginx...) | [count] | | | |
| Nb de technologies / outils distincts a maitriser | [count] | | | |

---

## Flexibilite / controle (matrice binaire)

| Capacite | Source | IaaS | PaaS | SaaS |
|---|---|---|---|---|
| Choisir la version de l'OS | [bin] | | | |
| Choisir la version du runtime | [bin] | | | |
| Acces SSH / systeme | [bin] | | | |
| Configurer le firewall | [bin] | | | |
| Acceder aux logs systeme | [bin] | | | |
| Controler le scaling manuellement | [bin] | | | |
| Installer un logiciel systeme arbitraire | [bin] | | | |
| **Score de controle** = nombre de "oui" ci-dessus | [count] | /7 | /7 | /7 |

---

## Dependance / verrouillage (lock-in)

| Metrique | Source | IaaS | PaaS | SaaS |
|---|---|---|---|---|
| Nb de services externes utilises | [count] | | | |
| Nb d'API proprietaires utilisees | [count] | | | |
| Nb de fichiers de config specifiques au fournisseur | [count] | | | |
| **Cout de migration** = nb de lignes (code+config) a changer pour changer de fournisseur | [count] | | | |

---

## Cout & exploitation (vision entreprise)

> Les experiences se font en offres GRATUITES (cout reel = 0 partout, peu parlant).
> Pour une lecture "entreprise", on releve des chiffres FACTUELS et publics :
> grilles tarifaires, SLA affiches, et la repartition des responsabilites.

| Metrique | Source | IaaS | PaaS | SaaS |
|---|---|---|---|---|
| Prix mensuel de l'offre equivalente PAYANTE (EUR/mois) | [count] (grille tarifaire publique) | | | |
| Cout projete pour une charge cible (~__ req/s soutenu) (EUR/mois) | [count] (estimation tarifaire) | | | |
| SLA de disponibilite affiche par le fournisseur (%) | [count] (doc fournisseur) | | | |
| Scaling automatique fourni nativement | [bin] | | | |

### Effort de maintenance (modele de responsabilite partagee)
Pour chaque tache : qui en a la charge ? (Vous = a votre charge / Fournisseur)

| Tache recurrente | IaaS | PaaS | SaaS |
|---|---|---|---|
| Mises a jour / patchs de l'OS | | | |
| Mises a jour du runtime (Node...) | | | |
| Sauvegardes de la base de donnees | | | |
| Patchs de securite | | | |
| Configuration du scaling | | | |
| **Nb de taches "a votre charge"** (plus c'est haut, plus c'est couteux en exploitation) | /5 | /5 | /5 |

---

## Ressources mobilisees (la ou mesurable, surtout IaaS)

| Metrique | Source | IaaS | PaaS | SaaS |
|---|---|---|---|---|
| vCPU / RAM du plan ou de la VM | [count] (fiche offre) | | | |
| Pic d'usage CPU sous charge (%) | [auto] `top` sur la VM | | | n/a |
| Pic d'usage RAM sous charge (Mo) | [auto] `top` sur la VM | | | n/a |

---

## Complexite ressentie (qualitatif, EN COMPLEMENT des chiffres)
- IaaS : ...
- PaaS : ...
- SaaS : ...

## Conclusion : quel modele pour quel besoin ?
- ...
