import { test, expect } from '@playwright/test';

test('API-06: o feed preserva reactions.likes e reactions.dislikes do DummyJSON', async ({ request }) => {
  // Compara o contrato da aplicação com a API externa real, sem mocks de HTTP.
  const sourceResponse = await request.get('https://dummyjson.com/posts?limit=3&skip=0');
  expect(sourceResponse.status()).toBe(200);
  const source = await sourceResponse.json();

  const response = await request.get('/posts', { params: { limit: 3, skip: 0 } });
  expect(response.status()).toBe(200);
  const feed = await response.json();
  expect(feed.posts).toHaveLength(3);

  for (const sourcePost of source.posts) {
    const post = feed.posts.find((item: { id: number }) => item.id === sourcePost.id);
    expect(post).toBeDefined();
    expect(post.reactions).toEqual(sourcePost.reactions);
    expect(Number.isInteger(post.reactions.likes)).toBe(true);
    expect(Number.isInteger(post.reactions.dislikes)).toBe(true);
    expect(post.reactions.likes).toBeGreaterThanOrEqual(0);
    expect(post.reactions.dislikes).toBeGreaterThanOrEqual(0);
  }
});
