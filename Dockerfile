# Etapa 1: Build
FROM node:20-alpine AS builder

# Instalar pnpm globalmente
RUN npm install -g pnpm

WORKDIR /app

# Copiar archivos necesarios para dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias (solo las necesarias para build)
RUN pnpm install --frozen-lockfile

# Copiar el resto del código
COPY . .

# Compilar TypeScript a JavaScript
RUN pnpm build


# Etapa 2: Runtime
FROM node:20-alpine AS runner

# Instalar pnpm globalmente (opcional, solo si lo usas en runtime)
RUN npm install -g pnpm

WORKDIR /app

# Copiar solo los archivos necesarios desde la etapa anterior
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/build ./build

# Instalar solo dependencias de producción
RUN pnpm install --prod --frozen-lockfile

# Exponer el puerto de tu servidor (cámbialo si usas otro)
EXPOSE 3000

# Comando de inicio
CMD ["node", "build/index.js"]
