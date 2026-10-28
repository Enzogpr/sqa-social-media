// Request descreve o tipo de uma requisição observada no navegador.
import { type Request } from '@playwright/test';
// Esta versão de test acrescenta a fixture "api" para preparação/verificação HTTP.
import { test, expect } from '../support/fixtures';
import { createUser, newCredentials } from '../support/users';

// page é uma aba de navegador real, em um contexto novo para cada teste.
// api é um cliente HTTP separado: cadastrar por ele não faz login no navegador.
// As ações e verificações usam await para respeitar a ordem do fluxo.
test.describe('Fluxos de usuário no navegador', () => {
  test('E2E-01: cadastra pelo formulário, acessa o feed e faz logout', async ({ page, api }) => {
    // 1. PREPARAR: dados exclusivos; este caso cadastra inteiramente pela tela.
    const credentials = newCredentials();
    // 2. NAVEGAR: "/" é relativo à baseURL do frontend no projeto "e2e".
    await page.goto('/');
    // getByRole procura o botão pelo papel e nome acessível.
    // exact evita selecionar outro botão cujo nome apenas contenha o texto.
    await page.getByRole('button', { name: 'Criar Conta', exact: true }).click();
    // A expressão regular exige que a URL termine em /signup.
    await expect(page).toHaveURL(/\/signup$/);

    // 3. PREENCHER: limitar a busca ao form evita confundir botão com o cabeçalho.
    const form = page.locator('form');
    // Selecionamos os campos visíveis do formulário pelo placeholder e tipo.
    await form.getByPlaceholder('seu@email.com').fill(credentials.email);
    // nth começa em zero: 0 é senha; 1 é confirmação da senha.
    await form.locator('input[type="password"]').nth(0).fill(credentials.password);
    await form.locator('input[type="password"]').nth(1).fill(credentials.password);
    // 4. ENVIAR: o clique submete o formulário e aciona frontend + API reais.
    await form.getByRole('button', { name: 'Criar Conta', exact: true }).click();

    // 5. VALIDAR NA TELA: voltou ao feed e aparece a opção de sair da sessão.
    // toBeVisible espera a interface atualizar dentro do timeout configurado.
    await expect(page.getByRole('heading', { name: 'Feed de Posts' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sair', exact: true })).toBeVisible();
    // 6. CONFIRMAR NA API: o usuário criado pela tela pode fazer login por HTTP.
    // Essa chamada não muda o estado de autenticação da aba.
    const signin = await api.post('/auth/signin', { data: credentials });
    expect(signin.status()).toBe(200);
    expect(await signin.json()).toMatchObject({ email: credentials.email, id: expect.any(Number) });

    // 7. ENCERRAR O FLUXO: logout deve mostrar Entrar e retirar Sair da tela.
    await page.getByRole('button', { name: 'Sair', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sair', exact: true })).toHaveCount(0);
  });

  test('E2E-02: faz login e mantém a sessão após recarregar a página', async ({ page, api }) => {
    // 1. PREPARAR pela API: este caso foca no login, não repete o cadastro na tela.
    const user = await createUser(api);
    // 2. AGIR NA TELA: abrir o login, preencher os dados e enviar o formulário.
    await page.goto('/signin');
    const form = page.locator('form');
    await form.getByPlaceholder('seu@email.com').fill(user.email);
    await form.locator('input[type="password"]').fill(user.password);
    await form.getByRole('button', { name: 'Entrar', exact: true }).click();

    // 3. VALIDAR: o login funcionou antes de testar a recarga da página.
    await expect(page.getByRole('heading', { name: 'Feed de Posts' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sair', exact: true })).toBeVisible();
    // 4. RECARREGAR: simula F5 e obriga a aplicação a recuperar a sessão salva.
    await page.reload();
    // 5. VALIDAR PERSISTÊNCIA: o usuário deve continuar autenticado.
    // Regressão do defeito histórico de RESULTADOS.md, corrigido para a etapa de CI.
    // A verificação continua ativa para impedir que a perda de sessão volte.
    await expect(page.getByRole('button', { name: 'Sair', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Posts Curtidos', exact: true })).toBeVisible();
  });

  test('E2E-03: bloqueia curtida anônima e permite curtir e descurtir após login', async ({ page, api }) => {
    // 1. PREPARAR: existe um usuário no backend, mas a aba começa sem login.
    const user = await createUser(api);
    await page.goto('/');
    // O PostCard usa role=listitem. first seleciona o primeiro card do feed.
    const firstPost = page.getByRole('listitem').first();
    await expect(firstPost).toBeVisible();

    // 2. OBSERVAR A REDE: contar POSTs de curtida enquanto o visitante é anônimo.
    // Apenas observamos as requisições; nenhuma resposta é interceptada/falsificada.
    let anonymousLikeRequests = 0;
    const trackLike = (request: Request) => {
      // pathname ignora a query string; \d+ aceita qualquer ID numérico de post.
      if (request.method() === 'POST' && /\/posts\/\d+\/like$/.test(new URL(request.url()).pathname)) {
        anonymousLikeRequests++;
      }
    };
    page.on('request', trackLike);
    // 3. TENTAR CURTIR: começar a esperar pelo alert ANTES do clique.
    const dialogPromise = page.waitForEvent('dialog');
    // Não esperamos o clique ainda: primeiro precisamos fechar o alert que ele abre.
    // /Curtir$/ aceita o emoji antes do texto e exige "Curtir" no fim do nome.
    const clickPromise = firstPost.getByRole('button', { name: /Curtir$/ }).click();
    const dialog = await dialogPromise;
    const dialogMessage = dialog.message();
    // accept equivale a clicar OK no alert; agora o clique pode concluir.
    await dialog.accept();
    await clickPromise;
    // 4. VALIDAR BLOQUEIO: mensagem correta, botão ainda não curtido e zero POSTs.
    expect(dialogMessage).toBe('Você precisa estar autenticado para curtir posts!');
    await expect(firstPost.getByRole('button', { name: /Curtir$/ })).toBeVisible();
    expect(anonymousLikeRequests).toBe(0);
    // Parar a contagem: as próximas curtidas serão de um usuário autenticado.
    page.off('request', trackLike);

    // 5. FAZER LOGIN pela interface com o usuário preparado no começo do teste.
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    const form = page.locator('form');
    await form.getByPlaceholder('seu@email.com').fill(user.email);
    await form.locator('input[type="password"]').fill(user.password);
    await form.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Sair', exact: true })).toBeVisible();
    await expect(firstPost).toBeVisible();
    // Guardar o título para procurar o mesmo card na página de posts curtidos.
    const title = await firstPost.getByRole('heading').innerText();

    // 6. CURTIR: registrar a espera pela resposta antes do clique evita perdê-la.
    // Filtramos pelo método e endpoint para não confundir com outras respostas.
    const likeResponsePromise = page.waitForResponse(response =>
      response.request().method() === 'POST' && /\/posts\/\d+\/like$/.test(new URL(response.url()).pathname));
    await firstPost.getByRole('button', { name: /Curtir$/ }).click();
    const likeResponse = await likeResponsePromise;
    // 7. VALIDAR: backend confirmou a curtida e a tela mostra "Curtido".
    expect(likeResponse.status()).toBe(200);
    const reaction = await likeResponse.json();
    expect(reaction).toMatchObject({ postId: expect.any(Number), liked: true });
    await expect(firstPost.getByRole('button', { name: /Curtido$/ })).toBeVisible();

    // 8. CONFIRMAR PERSISTÊNCIA por HTTP; params envia valores na query string.
    const liked = await api.get('/posts/liked', { params: { userId: user.id, limit: 10 } });
    expect(liked.status()).toBe(200);
    // toContainEqual busca um item na lista; objectContaining confere só esses campos.
    expect((await liked.json()).posts).toContainEqual(expect.objectContaining({ id: reaction.postId, liked: true }));

    // 9. NAVEGAR: abrir Posts Curtidos pelo botão, como um usuário faria.
    await page.getByRole('button', { name: 'Posts Curtidos', exact: true }).click();
    await expect(page).toHaveURL(/\/auth\/liked$/);
    // filter/has escolhe o card que contém um título idêntico ao guardado.
    const likedPost = page.getByRole('listitem').filter({ has: page.getByRole('heading', { name: title, exact: true }) });
    await expect(likedPost).toBeVisible();
    // 10. DESCURTIR: o mesmo endpoint alterna entre curtir e descurtir.
    // Desta vez filtramos pelo ID exato do post que acabamos de curtir.
    const unlikeResponsePromise = page.waitForResponse(response =>
      response.request().method() === 'POST' && new URL(response.url()).pathname === `/posts/${reaction.postId}/like`);
    await likedPost.getByRole('button', { name: /Curtido$/ }).click();
    const unlikeResponse = await unlikeResponsePromise;
    // 11. VALIDAR: backend informou liked=false e o card foi removido da lista.
    expect(unlikeResponse.status()).toBe(200);
    expect(await unlikeResponse.json()).toEqual({ postId: reaction.postId, liked: false });
    await expect(likedPost).toHaveCount(0);

    // 12. CONFIRMAR REMOÇÃO por HTTP. Este usuário só curtiu um post neste teste.
    const afterUnlike = await api.get('/posts/liked', { params: { userId: user.id, limit: 10 } });
    expect(afterUnlike.status()).toBe(200);
    expect(await afterUnlike.json()).toMatchObject({ posts: [], total: 0 });
  });
});
