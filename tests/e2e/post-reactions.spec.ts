import { test, expect } from '@playwright/test';

test('E2E-04: a Home mostra os contadores de likes e dislikes recebidos da API', async ({ page }, testInfo) => {
  // Registrar a espera antes de navegar evita perder a resposta que preenche a Home.
  const responsePromise = page.waitForResponse(response =>
    response.request().method() === 'GET' && new URL(response.url()).pathname === '/posts');
  await page.goto('/');
  const response = await responsePromise;
  expect(response.status()).toBe(200);
  const feed = await response.json();
  expect(feed.posts.length).toBeGreaterThan(0);

  const cards = page.getByRole('listitem');
  await expect(cards).toHaveCount(feed.posts.length);
  // Cada card deve mostrar os valores do seu próprio post, inclusive zero.
  for (let index = 0; index < feed.posts.length; index++) {
    const post = feed.posts[index];
    const card = cards.nth(index);
    await expect(card.getByRole('heading')).toHaveText(post.title);
    await expect(card.getByTestId('post-likes')).toHaveText(`👍 ${post.reactions.likes} curtidas`);
    await expect(card.getByTestId('post-dislikes')).toHaveText(`👎 ${post.reactions.dislikes} descurtidas`);
  }

  // Evidência da funcionalidade no relatório HTML e nos artefatos da CI.
  const screenshot = testInfo.outputPath('home-reactions.png');
  await page.screenshot({ path: screenshot, fullPage: true });
  await testInfo.attach('Home com contadores', { path: screenshot, contentType: 'image/png' });
});
