# Imagen base de Node.js 20
FROM node:20

# Directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia package.json y package-lock.json primero para aprovechar cache
COPY package*.json ./

# Instala dependencias (solo producción)
RUN npm install --production

# Copia el resto del código
COPY . .

# Expone el puerto interno que Fly.io usará
EXPOSE 8080

# Comando de arranque
CMD ["node", "index.js"]
