
import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const apiURL = process.env.API_BASE_URL || 'http://localhost:8080';
const clientURL = process.env.CLIENT_BASE_URL || 'http://localhost:3000';

const startServers = process.env.START_SERVERS === 'true';

const apiPort = new URL(apiURL).port || '8080';
const clientPort = new URL(clientURL).port || '3000';

export default defineConfig({
  // Procurar arquivos de teste nesta pasta; testMatch separa API de E2E abaixo.
  testDir: '.',
  // Os casos não dependem uns dos outros e podem rodar em paralelo.
  fullyParallel: true,
  // Em CI, impedir test.only, que deixaria os outros casos fora da execução.
  forbidOnly: !!process.env.CI,
  // Não repetir automaticamente: uma falha fica visível na primeira execução.
  retries: 0,
  // No máximo dois processos executando testes ao mesmo tempo.
  workers: 2,
  // Tempo máximo de um caso inteiro, em milissegundos: 60 segundos.
  timeout: 60_000,
  // As verificações da tela podem esperar até 15 segundos pela atualização.
  expect: { timeout: 15_000 },
  // Resultado no terminal e relatório HTML; não abrir o navegador automaticamente.
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    // Limites para ações (fill/click) e navegação (goto/reload).
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    // Em falhas, guardar trace (ações/rede) e screenshot para investigação.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Neste grupo, request.post('/auth/...') aponta para o backend.
    { name: 'api', testMatch: 'api/**/*.spec.ts', use: { baseURL: apiURL } },
    // Neste grupo, page.goto('/') aponta para o frontend em Chromium.
    { name: 'e2e', testMatch: 'e2e/**/*.spec.ts', use: { ...devices['Desktop Chrome'], baseURL: clientURL } },
  ],
  // Opcional: executa a aplicação real com um banco descartável, sem mocks HTTP.
  // O operador ? : fornece a lista de servidores só se startServers for true.
  // Caso contrário, os testes usam os servidores que você iniciou manualmente.
  webServer: startServers ? [
    {
      // Escolher o wrapper Maven correto para Windows ou Linux/macOS.
      // useTestClasspath disponibiliza o driver H2, já declarado com escopo test.
      command: `${process.platform === 'win32' ? 'mvnw.cmd' : 'bash ./mvnw'} spring-boot:run -Dspring-boot.run.useTestClasspath=true`,
      // cwd define a pasta onde o comando será executado.
      cwd: path.resolve(__dirname, '../api'),
      // Esperar este endpoint responder antes de iniciar os casos.
      // No banco novo, userId=0 não tem curtidas, dispensando consulta à DummyJSON.
      url: `${apiURL}/posts/liked?userId=0&limit=1`,
      // A inicialização da aplicação tem um limite próprio de 3 minutos.
      timeout: 180_000,
      // Não reutilizar outra API: queremos garantir o banco temporário deste modo.
      reuseExistingServer: false,
      // Variáveis só do processo iniciado; não editam application.properties.
      env: {
        SERVER_PORT: apiPort,
        // mem significa banco em memória, separado do MySQL de desenvolvimento.
        SPRING_DATASOURCE_URL: 'jdbc:h2:mem:playwright',
        SPRING_DATASOURCE_DRIVER_CLASS_NAME: 'org.h2.Driver',
        // Credenciais do H2 temporário, sem senha.
        SPRING_DATASOURCE_USERNAME: 'sa',
        SPRING_DATASOURCE_PASSWORD: '',
        // Hibernate cria as tabelas ao iniciar e as descarta ao encerrar.
        SPRING_JPA_HIBERNATE_DDL_AUTO: 'create-drop',
        // O dialeto informa como o Hibernate deve gerar SQL para o H2.
        SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT: 'org.hibernate.dialect.H2Dialect',
        // Evitar que cada consulta SQL polua o terminal durante a apresentação.
        SPRING_JPA_SHOW_SQL: 'false',
      },
    },
    {
      // Iniciar o frontend Next.js na porta escolhida e esperar sua página inicial.
      command: `npm run dev -- --port ${clientPort}`,
      cwd: path.resolve(__dirname, '../client'),
      url: clientURL,
      timeout: 180_000,
      reuseExistingServer: false,
      // Fazer o frontend chamar a MESMA API usada pelos testes HTTP.
      env: { NEXT_PUBLIC_BASE_URL: apiURL },
    },
  ] : undefined,
});
