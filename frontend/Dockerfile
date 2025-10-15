FROM node:20-alpine

WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm ci --loglevel=error

# Copier les fichiers de configuration
COPY vite.config.ts tsconfig.json postcss.config.js tailwind.config.js index.html ./

# Copier les dossiers source
COPY src ./src

# Construire l'application pour la production
RUN npm run build

EXPOSE 80
CMD ["npm","run","preview","--","--host","0.0.0.0","--port","80"]
