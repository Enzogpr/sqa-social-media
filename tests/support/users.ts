// UUID é um identificador aleatório que evita repetir o e-mail de outro caso.
import { randomUUID } from 'node:crypto';
import { expect, type APIRequestContext } from '@playwright/test';

// Apenas monta dados; esta função não envia requisições e não cadastra ninguém.
export function newCredentials() {
  return {
    email: `qa-${randomUUID()}@example.com`,
    // Válida nas duas aplicações, que hoje têm regras de senha diferentes.
    password: 'Teste123@',
  };
}

// Preparação reutilizável para os casos que precisam de um usuário já cadastrado.
// Se credentials não for informado, o parâmetro padrão gera novos dados.
export async function createUser(api: APIRequestContext, credentials = newCredentials()) {
  // 1. Cadastrar pelo endpoint público, sem importar serviço ou acessar o banco.
  const response = await api.post('/auth/signup', { data: credentials });
  // 2. Confirmar a preparação. O texto da resposta ajuda a diagnosticar uma falha.
  expect(response.status(), await response.text()).toBe(200);
  const user = await response.json();
  expect(user).toMatchObject({ id: expect.any(Number), email: credentials.email });
  expect(user.id).toBeGreaterThan(0);
  // 3. Devolver e-mail/senha originais e ID retornado para as próximas etapas.
  // ... copia os campos. "as number" informa o tipo ao TypeScript, sem converter.
  return { ...credentials, id: user.id as number };
}
