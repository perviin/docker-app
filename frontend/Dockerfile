#build de l'application React
FROM node:18-alpine AS builder

WORKDIR /app

#copier les fichiers de dépendances
COPY package*.json ./

#installer les dépendances
RUN npm install && npm cache clean --force

#copier le code source
COPY . .

#build de production
RUN npm run build

#serveur nginx(reverse proxy)
FROM nginx:1.25-alpine

#créer un utilisateur non-root
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001 -G nginx-user

#copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/nginx.conf

#copier les fichiers buildés depuis le stage précédent
COPY --from=builder /app/build /usr/share/nginx/html

#ajuster les permissions
RUN chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-user /var/run/nginx.pid

#changer vers l'utilisateur non-root
USER nginx-user

#exposer le port
EXPOSE 80

#health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

#démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]