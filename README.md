# cloud-comparison — IaaS vs PaaS vs SaaS

POC unique servant de base aux experiences de l'UE *Introduction a la recherche*.

**Problematique :** comment les modeles de service du cloud (IaaS, PaaS, SaaS)
influencent-ils les performances, la complexite de deploiement et la flexibilite
d'une application web ?

**Principe d'equite :** une seule et meme application (API CRUD `tasks`) est
deployee de 3 facons differentes. Le **code ne change pas** ; seul l'hebergement
change. On mesure les 3 avec le **meme** script de charge et des **metriques
objectives** (pas de chrono "humain", pas de note au doigt mouille).

---

## 1. L'application (le POC commun)

API REST minimale autour d'une ressource `task` (`id`, `title`, `done`, `created_at`),
persistee dans PostgreSQL.

| Methode | Route | Role |
|---|---|---|
| GET | `/health` | sonde (app + base) |
| GET | `/tasks` | liste |
| GET | `/tasks/:id` | lecture |
| POST | `/tasks` | creation |
| PUT | `/tasks/:id` | mise a jour |
| DELETE | `/tasks/:id` | suppression |

Le seul point de configuration est la variable d'environnement `DATABASE_URL`
(voir `.env.example`). C'est ce qui permet de garder un code identique partout.

### Lancer en local (pour tester avant de deployer)
```bash
npm install
# Une base PostgreSQL doit tourner et DATABASE_URL doit pointer dessus
npm run init-db    # cree la table tasks
npm start          # API sur http://localhost:3000
```

Test rapide :
```bash
curl localhost:3000/health
curl -X POST localhost:3000/tasks -H 'Content-Type: application/json' -d '{"title":"hello"}'
curl localhost:3000/tasks
```

---

## 2. Le protocole de mesure (identique pour les 3)

### Performance — avec k6 (automatique)
Installer k6 (https://k6.io). AVANT chaque mesure, remettre la base a l'etat de
depart (table vide) pour des conditions equivalentes :
```bash
bash metrics/reset-db.sh                       # local
DATABASE_URL="postgres://..." bash metrics/reset-db.sh   # deploiement distant
```
Puis lancer le **meme** script contre chaque URL :
```bash
k6 run -e BASE_URL=http://<adresse-du-deploiement> -e VUS=10 \
       --summary-export=metrics/results-<modele>.json \
       load-test/crud-test.js
```
k6 sort directement : temps de reponse **moyen**, **p50/p95/p99**, **max**, **TTFB**,
**debit (req/s)** et **taux d'erreurs** sous charge. -> a recopier dans le tableau.

> Conseil d'equite : memes `VUS`, meme duree, et si possible meme region cloud
> pour les 3, afin de ne comparer que le modele de service.

Metriques de perf supplementaires (automatiques) :
```bash
# Cold start : latence de la 1ere requete apres inactivite (PaaS qui s'endort vs IaaS)
BASE_URL=https://<adresse> bash metrics/cold-start.sh

# Courbe latence vs concurrence : rejoue a 10/50/100 VUs (reaction sous charge)
BASE_URL=http://<adresse> MODEL=iaas bash metrics/latency-curve.sh
```

### Complexite — volumetries non discutables
```bash
bash metrics/count.sh   # lignes de code + nb de dependances applicatives
```
A completer manuellement (mais factuel) lors de chaque deploiement :
- **nb de commandes / etapes** pour aller de zero a "en ligne",
- **nb de fichiers de configuration**,
- **nb de dependances systeme** a installer soi-meme,
- **nb de services externes** et **d'API proprietaires** utilisees.

### Tableau final
Tout se reporte dans `metrics/comparison-template.md`.

---

## 3. Les 3 deploiements

### 3.1 IaaS — vous gerez tout (sur une VM nue)
Cloud gratuit conseille : **Oracle Cloud Always Free** (VM gratuite a vie, genereuse),
sinon AWS EC2 free tier (12 mois) ou GCP e2-micro.

Etapes type (a COMPTER pour la metrique "nb d'etapes") :
1. Creer la VM, ouvrir le port 80/3000 dans le firewall cloud.
2. SSH sur la VM, `sudo apt update && sudo apt upgrade`.
3. Installer Node.js.
4. Installer et configurer PostgreSQL (creer user + base).
5. Copier le code (git clone / scp), `npm install`, regler `.env`.
6. `npm run init-db`.
7. Lancer l'app en service (systemd ou pm2) pour qu'elle survive a la deconnexion.
8. (Optionnel) reverse proxy nginx devant l'app.

-> Beaucoup d'etapes, controle total. C'est le deploiement le plus revelateur.

### 3.2 PaaS — la plateforme gere l'infra
Cloud gratuit conseille : **Render** (free tier) ou Railway / Fly.io / Koyeb.

Etapes type :
1. Pousser le code sur un repo Git (GitHub).
2. Creer un "Web Service" connecte au repo (build = `npm install`, start = `npm start`).
3. Ajouter une base PostgreSQL managee (add-on) -> recupere `DATABASE_URL`, mettre `PGSSL=require`.
4. Lancer `init-db` une fois (console de la plateforme).

-> Beaucoup moins d'etapes, plus de fichiers/commandes manuels, mais moins de controle (OS, etc.).

### 3.3 SaaS / BaaS — service pret a l'emploi (etape suivante)
Idee : **Supabase** (ou Firebase). On cree la table `tasks` et le service
**auto-genere l'API REST** -> quasiment **zero ligne de backend a ecrire**.
On compare alors la meme charge CRUD contre l'API generee.
(Ce variant sera ajoute apres avoir valide IaaS + PaaS.)

---

## 4. Arborescence
```
cloud-comparison/
├── src/
│   ├── app.js               # assemblage Express (thin) : /health + montage du routeur
│   ├── tasks.routes.js      # routeur CRUD (asyncHandler, pas de try/catch repete)
│   ├── tasks.repository.js  # acces aux donnees (toute la logique SQL)
│   ├── db.js                # connexion PostgreSQL (via DATABASE_URL)
│   └── init-db.js           # applique le schema
├── db/
│   └── schema.sql      # table tasks
├── load-test/
│   └── crud-test.js    # script de charge k6 (CRUD aleatoire) — le MEME pour les 3
├── metrics/
│   ├── count.sh                 # complexite objective (LOC + dependances)
│   ├── reset-db.sh              # vide la table avant chaque mesure (conditions egales)
│   ├── cold-start.sh            # latence 1ere requete apres inactivite
│   ├── latency-curve.sh         # latence vs concurrence (10/50/100 VUs)
│   └── comparison-template.md   # tableau final IaaS/PaaS/SaaS (metriques objectives)
├── .env.example
├── package.json
└── README.md
```
