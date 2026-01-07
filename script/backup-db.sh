#!/bin/bash

BACKUP_DIR="./database/backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"

#créer le dossier de backup s'il n'existe pas
mkdir -p ${BACKUP_DIR}

echo "Sauvegarde de la base de données"

#charger les variables d'environnement
source .env

#effectuer le backup
docker-compose exec -T database pg_dump -U ${DB_USER} ${DB_NAME} > ${BACKUP_FILE}

if [ $? -eq 0 ]; then
    echo "Backup réussi: ${BACKUP_FILE}"
    
    #garder seulement les 5 derniers backups
    ls -t ${BACKUP_DIR}/backup_*.sql | tail -n +6 | xargs -r rm
    echo "Anciens backups nettoyés"
else
    echo "Erreur lors du backup"
    exit 1
fi