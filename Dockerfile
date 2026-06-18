# syntax=docker/dockerfile:1

# ---- Stage 1: build the static SPA ----
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies. `npm install` (en lugar de `npm ci`) porque
# el lockfile se genera en macOS y no fija las dependencias nativas de Linux/musl
# (rolldown/@emnapi/*) que Alpine necesita
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_AUTH0_DOMAIN
ARG VITE_AUTH0_CLIENT_ID
ARG VITE_AUTH0_AUDIENCE
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_AUTH0_DOMAIN=$VITE_AUTH0_DOMAIN \
    VITE_AUTH0_CLIENT_ID=$VITE_AUTH0_CLIENT_ID \
    VITE_AUTH0_AUDIENCE=$VITE_AUTH0_AUDIENCE

COPY . .
RUN npm run build

# ---- paso 2: servir los archivos compilados ----
FROM node:22-alpine AS runtime

WORKDIR /app

# `serve -s` proporciona el fallback de historial de SPA para que los enlaces
# profundos / refresh (por ejemplo, /reporter/tablero) se resuelvan a index.html
# en lugar de 404.
RUN npm i -g serve

COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
