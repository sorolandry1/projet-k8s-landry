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

EXPOSE 5173
CMD ["npm","run","dev","--","--host","0.0.0.0","--port","5173"]
