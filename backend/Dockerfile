#build
FROM node:18-alpine AS builder

#créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

#copier les fichiers de dépendances
COPY package*.json ./

#installer les dépendances
RUN npm install --only=production && npm cache clean --force

#production
FROM node:18-alpine

#installer dumb-init pour une meilleure gestion des processus
RUN apk add --no-cache dumb-init

#créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

#copier les dépendances depuis le builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

#copier le code source
COPY --chown=nodejs:nodejs . .

#créer le dossier logs
RUN mkdir -p /app/logs && chown nodejs:nodejs /app/logs

#changer vers l'utilisateur non-root
USER nodejs

#exposer le port
EXPOSE 3000

#health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

#démarrer l'application avec dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/index.js"]