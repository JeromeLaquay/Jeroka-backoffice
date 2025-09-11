# Utiliser Node.js 18 Alpine pour une image légère
FROM node:18-alpine AS base

# Installer les dépendances système nécessaires
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    postgresql-client

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers de package pour optimiser le cache Docker
COPY package*.json ./
COPY tsconfig*.json ./

# Étape de construction
FROM base AS build

# Installer toutes les dépendances (dev + prod)
RUN npm install

# Copier le code source
COPY src/ ./src/

# Construire l'application TypeScript
RUN npm run build

# Étape de production
FROM base AS production

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Installer uniquement les dépendances de production
RUN npm install --only=production && npm cache clean --force

# Copier les fichiers construits depuis l'étape build
COPY --from=build /app/dist ./dist

# Créer les répertoires nécessaires
RUN mkdir -p uploads logs && \
    chown -R nodejs:nodejs /app

# Exposer le port
EXPOSE 3002

# Changer vers l'utilisateur non-root
USER nodejs

# Commande de santé pour Docker
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3002/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Commande de démarrage
CMD ["node", "dist/server.js"]
