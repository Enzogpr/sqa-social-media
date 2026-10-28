# SQA Social Media

Projeto educacional com uma API Spring Boot e um frontend Next.js, totalmente containerizado com Docker.

## Visão Geral

- `api/`: backend Java 17 com Spring Boot, autenticação, usuários, posts e curtidas.
- `client/`: frontend Next.js/React que consome a API.
- `tests/`: testes de API e E2E com Playwright, incluindo documentação e relatórios.
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

## Testes e integração contínua

Os testes das atividades anteriores estão organizados em:

- `api/src/test/java`: testes Java com JUnit, Mockito e MockMvc.
- `client/src/**/*.test.ts(x)`: testes de unidade e integração com Jest e Testing Library.
- `tests/api` e `tests/e2e`: testes de caixa-preta com Playwright.

A [pipeline de regressão](.github/workflows/ci.yml) executa em todo PR aberto ou atualizado para `main` e em pushes na `main`. Ela configura Java 17, Node.js 22, banco H2 em memória e Chromium, instala as dependências, executa os testes Java/Jest, valida o build e inicia a aplicação real para os testes de API/E2E. Os relatórios ficam nos artefatos da execução do GitHub Actions.

Para executar os testes de caixa-preta localmente:

```powershell
cd tests
npm ci
npm run install:browsers
npm run test:local
```

Consulte o [guia da Atividade 4 e da CI](tests/CI.md), o [README de testes](tests/README.md) e o [resumo dos testes](tests/RESUMO-DOS-TESTES.md). A documentação das gravações anteriores foi preservada como histórico das atividades.

## Autores

- Enzo - GitHub: @Enzogpr
- Matheus Lima - GitHub: @mits0014

