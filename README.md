# SQA Social Media

Projeto educacional com uma API Spring Boot e um frontend Next.js, totalmente containerizado com Docker.

## Visão Geral

- `api/`: backend Java 17 com Spring Boot, autenticação, usuários, posts e curtidas.
- `client/`: frontend Next.js/React que consome a API.
- `db`: banco de dados MySQL 8.

Principais rotas da aplicação após execução:
- Frontend: http://localhost:3000
- API: http://localhost:8080

## Como Rodar

**Pré-requisitos:**
- Docker e Docker Compose instalados.
- Git.

Siga os passos abaixo para iniciar a aplicação:

1. Clone o repositório:
```bash
git clone https://github.com/Enzogpr/sqa-social-media.git
cd sqa-social-media
```

2. Configure as variáveis de ambiente a partir do exemplo:
```bash
cp .env.example .env
```
*(O arquivo `.env.example` já possui credenciais padrão para rodar o banco localmente)*

3. Inicie os containers em segundo plano:
```bash
docker compose up -d --build
```
Aguarde alguns instantes até que o banco de dados inicialize e a API se conecte a ele. O ambiente estará totalmente no ar.

## Como Parar

Para parar a execução dos containers:
```bash
docker compose down
```

## Autores

- Enzo - GitHub: @Enzogpr
- Matheus Lima - GitHub: @mits0014

