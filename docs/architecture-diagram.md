# Architecture du Système (⌒‿⌒)

## Vue d'ensemble

Ce document décrit l'architecture complète de l'application web conteneurisée avec Docker.

---

## Schéma d'architecture général (^\_^)

```
┌─────────────────────────────────────────────────────────────────────┐
│                            UTILISATEUR                              │
│                         (Navigateur Web)                            │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               │ HTTP/HTTPS
                               │ Port 80/443
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         CONTENEUR FRONTEND (＾ω＾)                   │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │                       Nginx (1.25-alpine)                  │     │
│  │  ─────────────────────────────────────────────────────     │     │
│  │  • Servir les fichiers statiques React buildés            │     │
│  │  • Reverse Proxy pour /api/* → Backend                    │     │
│  │  • Gestion du cache des assets (1 an)                     │     │
│  │  • Headers de sécurité (X-Frame-Options, CSP, etc.)       │     │
│  │  • Compression Gzip                                        │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                       │
│  Image: nginx:1.25-alpine                                            │
│  Port exposé: 80, 443                                                │
│  Utilisateur: nginx-user (UID 1001) - non-root                       │
│  Volume: nginx.conf (read-only)                                      │
│  Réseau: frontend-network                                            │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               │ Requêtes /api/*
                               │ frontend-network
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         CONTENEUR BACKEND (＾ω＾)                    │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │                    Node.js + Express                       │     │
│  │  ─────────────────────────────────────────────────────     │     │
│  │  API REST Endpoints:                                       │     │
│  │  • GET  /health              → Health check                │     │
│  │  • GET  /api/db-test         → Test connexion DB          │     │
│  │  • GET  /api/users           → Liste utilisateurs         │     │
│  │  • GET  /api/users/:id       → Utilisateur par ID         │     │
│  │  • POST /api/users           → Créer utilisateur          │     │
│  │  • PUT  /api/users/:id       → Modifier utilisateur       │     │
│  │  • DELETE /api/users/:id     → Supprimer utilisateur      │     │
│  │                                                             │     │
│  │  Middleware:                                                │     │
│  │  • Helmet (sécurité)                                       │     │
│  │  • CORS                                                    │     │
│  │  • JSON parser                                             │     │
│  │  • Logging                                                 │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                       │
│  Image: node:18-alpine (custom)                                      │
│  Port exposé: 3000                                                   │
│  Utilisateur: nodejs (UID 1001) - non-root                           │
│  Volumes:                                                             │
│     • backend_logs:/app/logs (persistant)                           │
│     • ./backend/src:/app/src:ro (développement, read-only)         │
│  Réseaux: frontend-network + backend-network                        │
│  Depends on: database (avec health check)                            │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               │ Requêtes SQL
                               │ backend-network
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        CONTENEUR DATABASE (⌒‿⌒)                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │                   PostgreSQL 15                            │     │
│  │  ─────────────────────────────────────────────────────     │     │
│  │  Tables:                                                   │     │
│  │  • users (id, username, email, created_at, updated_at)    │     │
│  │                                                             │     │
│  │  Fonctionnalités:                                          │     │
│  │  • Triggers automatiques (update timestamp)               │     │
│  │  • Index sur email                                         │     │
│  │  • Contraintes UNIQUE sur username et email               │     │
│  │  • Script d'initialisation automatique                    │     │
│  │  • Health check (pg_isready)                              │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                       │
│  Image: postgres:15-alpine                                           │
│  Port: 5432 (INTERNE uniquement, non exposé)                        │
│  Utilisateur: postgres (défaut de l'image)                           │
│  Volumes:                                                             │
│     • db_data:/var/lib/postgresql/data (PERSISTANT)                │
│     • ./database/init:/docker-entrypoint-initdb.d (init SQL)       │
│  Réseau: backend-network                                             │
│  Restart policy: unless-stopped                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Architecture réseau (^-^)

### **Réseaux Docker**

```
┌────────────────────────────────────────────────────────────┐
│                    frontend-network                        │
│                      (Bridge)                              │
│                                                            │
│  ┌─────────────┐              ┌─────────────┐            │
│  │  Frontend   │ ←─────────→  │   Backend   │            │
│  │   (Nginx)   │              │  (Node.js)  │            │
│  └─────────────┘              └─────────────┘            │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                    backend-network                         │
│                      (Bridge)                              │
│                                                            │
│  ┌─────────────┐              ┌─────────────┐            │
│  │   Backend   │ ←─────────→  │  Database   │            │
│  │  (Node.js)  │              │ (PostgreSQL)│            │
│  └─────────────┘              └─────────────┘            │
└────────────────────────────────────────────────────────────┘
```

### **Isolation et sécurité**

- (^\_^) Frontend et Database **NE peuvent PAS communiquer directement**
- (^\_^) Backend est le **seul** à avoir accès à la base de données
- (^\_^) Database **n'est pas exposée** à l'extérieur (pas de port sur l'hôte)
- (^\_^) Chaque service a son réseau dédié (principe du moindre privilège)

---

## Gestion de la persistance (^-^)

### **Volumes Docker**

```
┌─────────────────────────────────────────────────────────┐
│                    VOLUMES DOCKER                        │
│                                                          │
│  1. db_data (Named Volume)                              │
│     └─ Stocke les données PostgreSQL                    │
│     └─ Persiste après docker-compose down               │
│     └─ Taille: ~100MB initialement                      │
│                                                          │
│  2. backend_logs (Named Volume)                         │
│     └─ Stocke les logs applicatifs                      │
│     └─ Persiste après docker-compose down               │
│     └─ Rotation automatique recommandée                 │
│                                                          │
│  3. ./database/init (Bind Mount)                        │
│     └─ Scripts SQL d'initialisation                     │
│     └─ Lecture seule                                    │
│     └─ Exécuté au premier démarrage uniquement          │
└─────────────────────────────────────────────────────────┘
```

### **Cycle de vie des données**

```
Démarrage initial
    │
    ├─→ Volume db_data créé (vide)
    │
    ├─→ PostgreSQL démarre
    │
    ├─→ Scripts dans ./database/init/ sont exécutés
    │   └─ Création des tables
    │   └─ Insertion des données de test
    │
    └─→ Données maintenant persistantes

docker-compose down
    │
    └─→ Conteneurs supprimés, MAIS volumes conservés
        └─→ db_data reste intact
        └─→ backend_logs reste intact

docker-compose down -v
    │
    └─→ (>_<) TOUT est supprimé (conteneurs + volumes)
        └─→ (T_T) Perte de toutes les données !
```

---

## Flux de données (^-^)

### **1. Requête utilisateur → Affichage**

```
[Utilisateur]
    │
    │ 1. GET http://localhost/
    ▼
[Frontend - Nginx]
    │
    │ 2. Retourne index.html + JS/CSS
    ▼
[Navigateur]
    │
    │ 3. Exécute le JavaScript React
    │ 4. Fetch /api/users
    ▼
[Frontend - Nginx]
    │
    │ 5. Proxy vers http://backend:3000/api/users
    ▼
[Backend - Express]
    │
    │ 6. Validation de la requête
    │ 7. Appel du modèle User.getAll()
    ▼
[Backend - Pool PostgreSQL]
    │
    │ 8. Exécute: SELECT * FROM users
    ▼
[Database - PostgreSQL]
    │
    │ 9. Retourne les données
    ▼
[Backend]
    │
    │ 10. Formate en JSON
    │ 11. Envoie la réponse
    ▼
[Frontend]
    │
    │ 12. Affiche les données dans l'interface
    ▼
[Utilisateur voit la liste]
```

### **2. Création d'un utilisateur**

```
[Utilisateur remplit le formulaire]
    │
    │ POST /api/users
    │ Body: {username: "john", email: "john@example.com"}
    ▼
[Frontend - Nginx] → [Backend - Express]
    │
    │ Validation des données
    │   • Username: 3-50 caractères
    │   • Email: format valide
    ▼
[Backend - Modèle User]
    │
    │ User.create(username, email)
    ▼
[Database - PostgreSQL]
    │
    │ INSERT INTO users (username, email) VALUES (...)
    │ RETURNING *
    ▼
[Backend]
    │
    │ Status 201 Created
    │ Response: {success: true, data: {...}}
    ▼
[Frontend]
    │
    │ Affiche un message de succès
    │ Recharge la liste des utilisateurs
    ▼
[Interface mise à jour]
```

---

## Mesures de sécurité (^-^)

### **1. Isolation des conteneurs**

```
┌────────────────────────────────────────┐
│  Utilisateur non-root dans chaque      │
│  conteneur (UID 1001)                  │
│                                        │
│  • Frontend:  nginx-user               │
│  • Backend:   nodejs                   │
│  • Database:  postgres (défaut)        │
└────────────────────────────────────────┘
```

### **2. Gestion des secrets**

```
Secrets stockés dans .env
    │
    ├─→ DB_PASSWORD
    ├─→ JWT_SECRET
    │
    └─→ Injectés comme variables d'environnement
        dans les conteneurs

.env est dans .gitignore
Jamais commité dans Git
```

### **3. Headers de sécurité HTTP**

```nginx
# Dans nginx.conf
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
```

### **4. Exposition des ports**

```
Port 80    → (^_^) Exposé (Frontend)
Port 443   → (^_^) Exposé (HTTPS - à configurer)
Port 3000  → (^_^) Exposé (Backend API)
Port 5432  → (T_T) NON exposé (Database)
```

---

## Monitoring et health checks (^-^)

### **Health checks configurés**

```yaml
Database:
  Test: pg_isready -U appuser
  Interval: 10s
  Timeout: 5s
  Retries: 5

Backend:
  Test: wget http://localhost:3000/health
  Interval: 30s
  Timeout: 10s
  Retries: 3

Frontend:
  Test: wget http://localhost:80
  Interval: 30s
  Timeout: 10s
  Retries: 3
```

### **Gestion des erreurs**

```
Backend démarre
    │
    ├─→ Attend que Database soit "healthy"
    │   (depends_on avec condition)
    │
    └─→ Si Database non disponible après 50s
        └─→ Backend échoue et redémarre (restart: unless-stopped)
```

---

## Déploiement et scalabilité (^-^)

### **Déploiement actuel**

```
Un serveur unique avec Docker Compose
    │
    ├─→ Frontend:  1 réplique
    ├─→ Backend:   1 réplique
    └─→ Database:  1 réplique
```

### **Évolution possible (Docker Swarm / Kubernetes)**

```
Load Balancer
    │
    ├─→ Frontend:  3 répliques (scale horizontal)
    │
    ├─→ Backend:   5 répliques (scale horizontal)
    │
    └─→ Database:  1 master + 2 replicas (read replicas)
```

---

## Performance (^-^)

### **Optimisations implémentées**

1. **Images légères** : Alpine Linux (< 100 MB par image)
2. **Build multi-stage** : Sépare construction et exécution
3. **Cache Nginx** : Assets statiques cachés 1 an
4. **Compression Gzip** : Réduit la bande passante
5. **Pool de connexions** : 20 connexions PostgreSQL réutilisées

### **Métriques typiques**

```
Temps de démarrage:
  • Database:  ~5 secondes
  • Backend:   ~8 secondes
  • Frontend:  ~3 secondes
  Total:       ~15 secondes

Mémoire utilisée:
  • Database:  ~50 MB
  • Backend:   ~80 MB
  • Frontend:  ~10 MB
  Total:       ~140 MB

Requêtes par seconde:
  • Backend:   ~500 req/s (single instance)
  • Frontend:  ~1000 req/s (fichiers statiques)
```

---

## Maintenance (^-^)

### **Sauvegardes**

```bash
# Script de backup automatique
./scripts/backup-db.sh

# Crée un fichier SQL dans ./database/backup/
# Format: backup_YYYYMMDD_HHMMSS.sql
# Conserve les 5 derniers backups
```

### **Logs**

```bash
# Accéder aux logs
docker-compose logs -f [service]

# Logs stockés dans:
  • Backend: Volume backend_logs
  • Database: /var/log/postgresql/ (dans le conteneur)
  • Frontend: /var/log/nginx/ (dans le conteneur)
```

### **Mise à jour**

```bash
# Mettre à jour les images
docker-compose pull

# Reconstruire les services
docker-compose build --no-cache

# Redémarrer avec les nouvelles versions
docker-compose up -d
```

---

## Technologies utilisées (^-^)

| Composant         | Technologie        | Version     | Rôle                           |
| ----------------- | ------------------ | ----------- | ------------------------------ |
| Frontend          | React              | 18.2.0      | Interface utilisateur          |
| Frontend Server   | Nginx              | 1.25-alpine | Serveur web + reverse proxy    |
| Backend           | Node.js            | 18-alpine   | Runtime JavaScript             |
| Backend Framework | Express            | 4.18.2      | Framework API REST             |
| Database          | PostgreSQL         | 15-alpine   | Base de données relationnelle  |
| ORM/Query         | pg (node-postgres) | 8.11.3      | Driver PostgreSQL              |
| Orchestration     | Docker Compose     | 3.8+        | Orchestration multi-conteneurs |

---

## Décisions architecturales (^-^)

### **Pourquoi ces choix ?**

1. **Alpine Linux** : Images 5x plus légères que les images standard
2. **Multi-stage builds** : Sépare les dépendances de dev/prod
3. **Utilisateurs non-root** : Meilleure sécurité (principe du moindre privilège)
4. **Deux réseaux séparés** : Isolation frontend/backend/database
5. **Health checks** : Garantit que les services sont vraiment prêts
6. **Volumes nommés** : Facilite la gestion et la sauvegarde
7. **Reverse proxy Nginx** : Centralise l'exposition et améliore les performances

---

## Cycle de développement (^-^)

```
Développeur modifie le code
    │
    ├─→ Backend: Le volume ./backend/src est monté en read-only
    │   └─→ Redémarrer: docker-compose restart backend
    │
    ├─→ Frontend: Nécessite rebuild (application React)
    │   └─→ Rebuild: docker-compose up -d --build frontend
    │
    └─→ Database: Modifications via migrations SQL
        └─→ Ajouter script dans ./database/init/
```

---

## 🆘 Diagnostic des pannes

### **Service ne démarre pas**

```bash
# Voir les logs détaillés
docker-compose logs [service]

# Vérifier la configuration
docker-compose config

# Inspecter un conteneur
docker inspect app-backend
```

### **Erreurs de connexion**

```bash
# Vérifier les réseaux
docker network ls
docker network inspect examen-docker_backend-network

# Tester la connectivité
docker-compose exec backend ping database
docker-compose exec backend nc -zv database 5432
```

---

## Checklist de déploiement (^-^)

- [ ] Docker et Docker Compose installés
- [ ] Fichier .env configuré avec des secrets forts
- [ ] Ports 80 et 3000 disponibles
- [ ] Au moins 4 GB de RAM disponibles
- [ ] 10 GB d'espace disque libre
- [ ] Tous les fichiers du projet présents
- [ ] Tests de connectivité réseau OK
- [ ] Health checks passent pour tous les services
- [ ] Backup automatique configuré (cron)

---

**Date de création** : 7 janvier 2026  
**Version de l'architecture** : 1.0  
**Dernière mise à jour** : 7 janvier 2026
