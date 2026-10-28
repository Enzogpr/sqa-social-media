import { test, expect } from '@playwright/test';
import { createUser, newCredentials } from '../support/users';


// request é fornecido pelo Playwright e usa a baseURL do projeto "api".
// async/await faz cada requisição terminar antes da próxima validação.
test.describe('API de autenticação — caixa preta', () => {
  test('API-01: cadastra um usuário e permite entrar com os mesmos dados', async ({ request }) => {
    // 1. PREPARAR: e-mail exclusivo para não conflitar com execuções anteriores.
    const credentials = newCredentials();
    // 2. AGIR: enviar o cadastro real; data vira o corpo JSON da requisição POST.
    const signup = await request.post('/auth/signup', { data: credentials });
    // 3. VALIDAR: cadastro aceito (200) e resposta identificada como JSON.
    expect(signup.status()).toBe(200);
    expect(signup.headers()['content-type']).toContain('application/json');
    // json() transforma a resposta HTTP em um objeto JavaScript.
    const user = await signup.json();
    // toMatchObject verifica os campos relevantes, permitindo campos extras.
    // any(Number) verifica o tipo; toBeGreaterThan garante um ID positivo.
    expect(user).toMatchObject({ id: expect.any(Number), email: credentials.email });
    expect(user.id).toBeGreaterThan(0);

    // 4. CONFIRMAR O EFEITO: os dados cadastrados devem permitir fazer login.
    // Isso verifica persistência observável por HTTP, sem consultar o banco.
    const signin = await request.post('/auth/signin', { data: credentials });
    expect(signin.status()).toBe(200);
    expect(await signin.json()).toMatchObject({ id: user.id, email: credentials.email });
  });

  test('API-02: rejeita cadastro com e-mail duplicado', async ({ request }) => {
    // 1. PREPARAR: garantir que este e-mail já existe antes de tentar duplicá-lo.
    const user = await createUser(request);
    // 2. AGIR: repetir o cadastro com o mesmo e-mail e senha.
    const response = await request.post('/auth/signup', {
      data: { email: user.email, password: user.password },
    });
    // 3. VALIDAR: 409 significa conflito com um registro existente.
    // toEqual exige que todo o objeto retornado corresponda ao esperado.
    expect(response.status()).toBe(409);
    // Mensagem do contrato atual da main, atualizada na atividade de autenticação.
    expect(await response.json()).toEqual({ message: 'E-mail já cadastrado', status: 409 });
  });

  test('API-03: retorna o usuário correto no login válido', async ({ request }) => {
    // 1. PREPARAR: criar um usuário só para este caso.
    const user = await createUser(request);
    // 2. AGIR: usar exatamente as credenciais recém-cadastradas.
    const response = await request.post('/auth/signin', {
      data: { email: user.email, password: user.password },
    });
    // 3. VALIDAR: sucesso e identidade correta, não apenas um HTTP 200 qualquer.
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ id: user.id, email: user.email });
  });

  test('API-04: rejeita login com senha incorreta', async ({ request }) => {
    // 1. PREPARAR: e-mail cadastrado e conhecido.
    const user = await createUser(request);
    // 2. AGIR: manter o e-mail correto e trocar somente a senha.
    // A senha errada tem formato válido para testar credenciais, não formato.
    const response = await request.post('/auth/signin', {
      data: { email: user.email, password: 'Errada123@' },
    });
    // 3. VALIDAR: 401 e mensagem informam que o login foi recusado.
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Credenciais inválidas', status: 401 });
  });

  test('API-05: rejeita cadastro com e-mail inválido', async ({ request }) => {
    // 1. PREPARAR/AGIR: e-mail sem @ e senha válida; só o e-mail é inválido.
    const response = await request.post('/auth/signup', {
      data: { email: 'email-sem-arroba.example.com', password: 'Teste123@' },
    });
    // 2. VALIDAR: 422 indica que a entrada não atende à validação da aplicação.
    expect(response.status()).toBe(422);
    expect(await response.json()).toEqual({ message: 'E-mail inválido', status: 422 });
  });
});
