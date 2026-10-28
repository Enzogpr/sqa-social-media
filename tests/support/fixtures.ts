// Renomeamos o test original para base; nosso test estende essa versão.
// APIRequestContext é o tipo do cliente HTTP que será entregue aos casos E2E.
import { test as base, type APIRequestContext } from '@playwright/test';

// Fixture = recurso que o Playwright prepara e libera para cada caso que o usa.
// O tipo <{ api: APIRequestContext }> permite escrever async ({ page, api }).
export const test = base.extend<{ api: APIRequestContext }>({
  api: async ({ playwright }, use) => {
    // 1. PREPARAR: cliente HTTP independente da aba, apontando para o backend.
    // O request padrão dos E2E usa a URL do frontend; por isso criamos este aqui.
    const api = await playwright.request.newContext({
      baseURL: process.env.API_BASE_URL || 'http://localhost:8080',
    });
    try {
      // 2. ENTREGAR o cliente ao teste. Só continuamos após o caso terminar.
      await use(api);
    } finally {
      // 3. LIBERAR conexões/respostas, mesmo se alguma validação do caso falhar.
      // dispose não apaga os usuários criados: apenas libera o contexto HTTP.
      await api.dispose();
    }
  },
});

// Reexportar expect permite importar test e expect juntos deste arquivo.
export { expect } from '@playwright/test';
