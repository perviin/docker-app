#!/bin/bash

echo "Démarrage de l'application..."

#vérifie si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "Docker n'est pas installer"
    exit 1
fi

#vérifier si le fichier .env existe
if [ ! -f .env ]; then
    echo "Fichier .env non trouvé. Copie de .env.example..."
    cp .env.example .env
    echo "Fichier .env créé, à configurer avant de continuer !!"
    exit 1
fi

# Démarrer les services
echo "Construction et démarrage des conteneurs"
docker-compose up --build -d

# Attendre que les services soient prêts
echo "Attente du démarrage des services"
sleep 10

# Vérifier l'état des services
echo ""
echo "État des services:"
docker-compose ps

echo ""
echo "Application démarrée !"
echo "Frontend: http://localhost"
echo "Backend API: http://localhost:3000"
echo "Logs: docker-compose logs -f"