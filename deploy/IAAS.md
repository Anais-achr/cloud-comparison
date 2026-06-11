# Déploiement IaaS — Google Cloud / GCP (VM nue)

> Objectif : tout installer soi-même sur une machine virtuelle. Chaque etape ci-dessous
> compte comme une "etape de deploiement" (metrique du tableau). Le nombre d'etapes et
> de dependances systeme est volontairement releve ici.
>
> NB : on est passe d'Oracle a GCP car l'offre gratuite Oracle (region Paris) etait
> saturee ("Out of capacity"). Le fournisseur ne change rien a la validite de l'etude :
> on mesure toujours "une VM nue ou j'installe tout moi-meme".

## Partie A — Compte + VM (dans le navigateur, une seule fois)

1. Se connecter sur https://console.cloud.google.com avec un compte Google et
   activer l'essai gratuit (300 $ / 90 jours ; carte pour verification, pas de debit auto).
2. Rechercher "Compute Engine" > activer l'API si demande > "Create Instance".
3. Reglages : Name `cloud-comparison-iaas`, Region `europe-west1` ou `europe-west9`,
   Machine type **e2-micro** (free tier).
4. Boot disk > Change > OS **Ubuntu 22.04 LTS**.
5. Firewall : cocher **"Allow HTTP traffic"**. Creer l'instance.
6. Ouvrir le port de l'app : VPC network > Firewall > Create firewall rule
   -> Name `allow-3000`, Ingress, Targets "All instances", Source `0.0.0.0/0`,
   Protocols/ports : TCP **3000**.
7. Noter l'**adresse IP externe** de l'instance.

## Partie B — Connexion SSH

Le plus simple sur GCP : bouton **"SSH"** a cote de l'instance (terminal dans le
navigateur, aucune cle a gerer). Le nom d'utilisateur par defaut est votre login Google.

Alternative en ligne de commande (si gcloud est installe) :
```bash
gcloud compute ssh cloud-comparison-iaas --zone=ZONE
```

NB : sur GCP l'utilisateur n'est pas "ubuntu" mais votre identifiant Google. Adapter
le chemin /home/<user>/ dans le fichier service plus bas si besoin.

## Partie C — Installation sur la VM (tout est manuel = c'est le point IaaS)

```bash
# 1. Mettre l'OS a jour
sudo apt update && sudo apt upgrade -y

# 2. Installer Node.js 22 (depot NodeSource)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Installer PostgreSQL (dependance systeme)
sudo apt install -y postgresql

# 4. Creer l'utilisateur et la base
sudo -u postgres psql -c "CREATE USER cloud WITH PASSWORD 'cloud';"
sudo -u postgres psql -c "CREATE DATABASE cloud_comparison OWNER cloud;"
```

(Sur GCP, l'image Ubuntu n'a PAS d'iptables restrictif : le port 3000 est gere
uniquement par la regle de pare-feu VPC creee en partie A.6. Rien a faire sur l'OS.)

Recuperer le code sur la VM. Le plus simple : depot GitHub (necessaire aussi pour le
PaaS), puis `git clone` sur la VM :
```bash
sudo apt install -y git
git clone https://github.com/<votre-compte>/cloud-comparison.git
```
(Alternative sans GitHub : bouton engrenage du SSH navigateur > "Upload file" pour
envoyer une archive .zip du projet, puis `unzip`.)

De retour sur la VM :
```bash
# 6. Installer les dependances applicatives
cd ~/cloud-comparison && npm install

# 7. Creer la table
DATABASE_URL=postgres://cloud:cloud@localhost:5432/cloud_comparison npm run init-db

# 8. Installer l'app en service (survit a la deconnexion)
# IMPORTANT : dans deploy/cloud-comparison.service, remplacer "ubuntu" par votre
# identifiant GCP (commande `whoami`) dans User= et WorkingDirectory= avant de copier.
sudo cp deploy/cloud-comparison.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now cloud-comparison
systemctl status cloud-comparison --no-pager
```

## Partie D — Vérification (depuis votre Mac)

```bash
curl http://ADRESSE_IP:3000/health        # doit repondre {"status":"ok"}
```

## Partie E — Mesures (depuis votre Mac)

```bash
# Performance + courbe de charge
BASE_URL=http://ADRESSE_IP MODEL=iaas bash metrics/latency-curve.sh
# Cold start (theoriquement nul en IaaS : la VM ne s'endort pas)
BASE_URL=http://ADRESSE_IP bash metrics/cold-start.sh
```

Sur la VM, pendant un test k6, relever l'usage ressources dans un autre terminal SSH :
```bash
top -b -n 1 | head -5      # pic CPU / RAM a reporter dans le tableau
```

## A reporter dans metrics/comparison-template.md (colonne IaaS)
- Nb d'etapes de deploiement : compter les commandes des parties C/D
- Dependances systeme installees : nodejs, postgresql (+ outils : curl, rsync, ssh, iptables)
- Fichiers de config crees : 1 (cloud-comparison.service) + regle pare-feu
- Score de controle : eleve (OS, runtime, firewall, SSH... tout est accessible)
- Services externes / API proprietaires : 0
