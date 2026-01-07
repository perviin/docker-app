#!/bin/bash

echo "Arrêt de l'application"

docker-compose down

echo "Application arrêtée avec succès!"
echo "Pour supprimer également les volumes il faut faire: docker-compose down -v"