# Penpal AI - Docker Compose Stack

Stack Docker Compose pour tous les services Penpal AI.

## 🎯 Services inclus

- **db-service** (Port 3001) - Service de base de données
- **auth-service** (Port 3002) - Service d'authentification
- **payment-service** (Port 3003) - Service de gestion des paiements
- **frontend-service** (Port 3000) - Interface utilisateur (commenté)
- **mongodb** (Port 27017) - Base de données MongoDB
- **mongo-express** (Port 8083) - Interface d'administration MongoDB
- **redis** (Port 6379) - Cache Redis

## 🚀 Démarrage rapide

### 1. Configuration des variables d'environnement

```bash
# Créer les fichiers .env à partir des templates
cp ./db-service/.env.template ./db-service/.env
cp ./auth-service/.env.template ./auth-service/.env
cp ./payment-service/env.template ./payment-service/.env

# Éditer les fichiers .env avec vos configurations
```

### 2. Démarrer tous les services

```bash
# Démarrer en mode développement
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Démarrer seulement certains services
docker-compose up -d mongodb redis db-service auth-service payment-service
```

### 3. Vérifier le statut des services

```bash
# Statut de tous les services
docker-compose ps

# Health checks
curl http://localhost:3001/api/v1/health  # DB Service
curl http://localhost:3002/api/v1/health  # Auth Service
curl http://localhost:3003/              # Payment Service
```

## 📚 Documentation des APIs

- **DB Service**: http://localhost:3001/api/docs
- **Auth Service**: http://localhost:3002/api/docs
- **Payment Service**: http://localhost:3003/api/docs

## 🔧 Administration

### MongoDB

- **Mongo Express**: http://localhost:8083
- **Credentials**: admin / admin123

### Redis

- **Host**: localhost:6379
- **Password**: redis123

## 🛠 Développement

### Arrêter les services

```bash
docker-compose down
```

### Rebuild après changements

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Voir les logs d'un service spécifique

```bash
docker-compose logs -f payment-service
```

### Exécuter des commandes dans un container

```bash
docker-compose exec payment-service npm run test
```

## 🔐 Configuration Stripe (Payment Service)

1. Créer un compte Stripe développeur
2. Récupérer les clés API depuis le dashboard
3. Mettre à jour `./payment-service/.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_your_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

## 🚨 Dépannage

### Problème de permissions

```bash
sudo chown -R $(whoami) ~/.npm
```

### Reset complet

```bash
docker-compose down -v
docker system prune -f
docker-compose up --build -d
```

### Vérifier les networks

```bash
docker network ls
docker network inspect compose_penpal-network
```

## 📋 Prérequis

- Docker 20.10+
- Docker Compose 2.0+
- Ports 3000-3003, 6379, 8083, 27017 disponibles
