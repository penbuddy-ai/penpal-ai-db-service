# Penpal AI Development Environment

Ce dossier contient la configuration Docker Compose pour le développement local de Penpal AI.

## Services

- **db-service** : Service de base de données de Penpal AI
- **mongodb** : Base de données MongoDB

## Prérequis

- Docker
- Docker Compose

## Configuration

1. Copiez le fichier `.env.example` vers `.env` :

```bash
cp .env.example .env
```

2. Modifiez les variables d'environnement dans `.env` selon vos besoins.

## Utilisation

Pour démarrer l'environnement de développement :

```bash
docker-compose up -d
```

Pour arrêter l'environnement :

```bash
docker-compose down
```

Pour voir les logs :

```bash
docker-compose logs -f
```

## Accès aux services

- **db-service** : http://localhost:3001
- **MongoDB** : mongodb://localhost:27017

## Configuration MongoDB

La base de données MongoDB est configurée avec :

- Authentification activée
- Base de données par défaut : `penpal-ai`
- Utilisateur root : défini dans le fichier `.env`
- Mot de passe root : défini dans le fichier `.env`

## Volumes

Les données MongoDB sont persistantes et stockées dans des volumes Docker :

- `mongodb_data` : données de la base de données
- `mongodb_config` : fichiers de configuration MongoDB

## Réseau

Les services communiquent via le réseau `penpal-network` avec la plage IP `172.28.0.0/16`.

## Health Checks

Les deux services incluent des health checks :

- **db-service** : vérifie l'endpoint `/api/health`
- **mongodb** : vérifie la connexion à la base de données

## Développement

Pour le développement, le code source est monté en volume dans le conteneur `db-service`, ce qui permet :

- Modifications en temps réel
- Débogage facile
- Pas besoin de reconstruire l'image à chaque changement

## Ajout d'autres services

Pour ajouter d'autres services à cette configuration :

1. Ajoutez le service dans `docker-compose.yml`
2. Configurez les dépendances avec `depends_on`
3. Ajoutez les variables d'environnement nécessaires dans `.env`
