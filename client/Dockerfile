# -- Estágio 1: Build --
FROM node:18-alpine AS build
WORKDIR /app

# Copia arquivos de dependências primeiro (para cache)
COPY package.json package-lock.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código
COPY . .

# Define a variável de ambiente para o build (aponta para a API via host)
ARG NEXT_PUBLIC_BASE_URL=http://localhost:8080
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

# Faz o build do Next.js
RUN npm run build

# -- Estágio 2: Runtime --
FROM node:18-alpine
WORKDIR /app

# Copia os artefatos de build do estágio anterior
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
