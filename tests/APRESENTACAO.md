# Roteiro para apresentar e entender os testes

> Roteiro histórico da Atividade 3. Na Atividade 4, o defeito de sessão e os labels foram corrigidos, e o contrato atual usa “E-mail já cadastrado”. Para a entrega de CI, use o PR aberto e a execução atual do GitHub Actions como evidência.

## 1. Explicar o objetivo

Uma forma de apresentar:

> O projeto contém 3 testes E2E e 5 testes de API com Playwright e TypeScript. Os testes de API enviam requisições HTTP e verificam as respostas. Os E2E usam o Chromium para percorrer fluxos pela interface, passando pelo frontend e backend reais.

Os testes ficam em `tests`, separados das aplicações `api` e `client`. Eles verificam o comportamento do sistema em execução. A classificação de caixa preta vem desse acesso por entradas e saídas públicas: requisições, respostas e interação com a interface.

## 2. Mostrar os arquivos nesta ordem

| Arquivo | O que explicar |
| --- | --- |
| `package.json` | Dependências e comandos para instalar, executar e abrir o relatório. |
| `playwright.config.ts` | Endereços, grupos API/E2E, navegador, execução paralela, tempos de espera e evidências de falha. |
| `support/users.ts` | Geração de e-mail exclusivo e cadastro de preparação pelo endpoint público. |
| `support/fixtures.ts` | Preparação e liberação do cliente HTTP utilizado pelos E2E. |
| `api/auth.spec.ts` | Os 5 casos de API, com preparação, ação e validação. |
| `e2e/user-flows.spec.ts` | Os 3 fluxos no navegador, com etapas numeradas. |
| `RESULTADOS.md` | Resultado da execução e reprodução do defeito encontrado. |

Os arquivos `package.json` e `tsconfig.json` usam JSON, que não aceita comentários. O `package-lock.json` é gerado pelo npm e registra as versões instaladas; suas linhas não precisam ser explicadas uma a uma.

`tsconfig.json` configura o TypeScript: `strict` ativa verificações mais rigorosas; `noEmit` permite conferir os tipos sem gerar arquivos JavaScript; `Node16` configura a resolução de módulos; `include` seleciona os arquivos TypeScript e `exclude` ignora dependências e relatórios. O Playwright executa os arquivos `.ts`, enquanto `npm run typecheck` faz a conferência estática dos tipos.

## 3. Entender a estrutura de um caso

Cada teste segue a sequência **preparar → agir → validar**:

```ts
test('exemplo de estrutura', async ({ request }) => {
  // PREPARAR: montar uma entrada conhecida.
  const dados = { email: 'email-invalido', password: 'Teste123@' };

  // AGIR: chamar o sistema em execução.
  const resposta = await request.post('/auth/signup', { data: dados });

  // VALIDAR: comparar a resposta com o resultado esperado.
  expect(resposta.status()).toBe(422);
});
```

Esse trecho é apenas uma explicação; não acrescenta um nono teste à suíte.

`test.describe` agrupa casos no relatório. `test` declara um caso. `async` permite operações assíncronas e `await` espera a operação terminar antes de continuar. `expect` é a asserção: se o resultado não corresponde ao esperado, o caso falha.

## 4. Explicar os 5 testes de API

| Caso | Preparação | Ação | Resultado esperado |
| --- | --- | --- | --- |
| API-01 | Gerar e-mail novo e senha válida. | Cadastrar e depois fazer login com os mesmos dados. | Cadastro e login retornam 200; mesmo ID/e-mail, ID positivo e resposta de cadastro em JSON. |
| API-02 | Cadastrar um usuário. | Tentar cadastrar novamente o mesmo e-mail. | 409 e mensagem `E-mail já está em uso`. |
| API-03 | Cadastrar um usuário próprio do caso. | Fazer login com credenciais corretas. | 200 e ID/e-mail do usuário preparado. |
| API-04 | Cadastrar um usuário. | Fazer login com e-mail correto e senha diferente, mas de formato válido. | 401 e mensagem `Credenciais inválidas`. |
| API-05 | Montar e-mail sem arroba e senha válida. | Enviar o cadastro. | 422 e mensagem `E-mail inválido`. |

API-01 confirma que o cadastro tornou o usuário disponível para login. API-03 concentra a verificação no endpoint de login e na identidade retornada. Ambos preparam seus próprios dados e podem rodar isoladamente.

Os códigos HTTP esperados correspondem ao contrato atual desta aplicação: **200** para sucesso, **409** para conflito, **401** para credenciais recusadas e **422** para entrada rejeitada pela validação. Conferir a mensagem além do status ajuda a detectar se a API recusou pelo motivo correto.

## 5. Explicar os 3 testes E2E

**E2E-01 — cadastro e logout:** abre a página inicial, acessa o cadastro, preenche e-mail/senha/confirmação e envia o formulário. Confirma o feed e o botão `Sair`. Uma chamada HTTP adicional verifica que as credenciais cadastradas pela tela permitem login. Por fim, clica em `Sair` e confirma que a interface oferece `Entrar`.

**E2E-02 — login e persistência:** prepara um usuário pela API e faz login pela interface. Primeiro confirma que o login funcionou. Depois recarrega a página, simulando F5, e verifica se os controles de usuário autenticado continuam disponíveis. Na execução registrada, o login inicial passou e a verificação após a recarga falhou.

**E2E-03 — curtidas:** prepara um usuário, mas começa com a aba sem login. Tenta curtir, verifica o alerta e confirma que nenhuma requisição de curtida foi enviada. Faz login pela interface, curte um post e confere a resposta HTTP, o botão `Curtido` e a presença do post pela API. Navega para `Posts Curtidos`, descurte e confirma a remoção tanto da tela quanto da lista retornada pela API.

Preparar um usuário por HTTP não autentica a aba. O navegador efetua o login pelo formulário. O contexto da aba é novo em cada caso, portanto a sessão de um teste não é herdada por outro.

## 6. Saber explicar as funções mais usadas

| Expressão | Significado neste projeto |
| --- | --- |
| `page.goto('/')` | Abrir a página inicial do frontend. |
| `page.reload()` | Recarregar a página atual. |
| `getByRole('button', { name: 'Entrar' })` | Localizar um botão pelo papel e pelo nome acessível. |
| `getByPlaceholder('seu@email.com')` | Localizar o campo pelo texto de exemplo. |
| `locator('input[type="password"]')` | Localizar campos de senha com um seletor CSS. |
| `nth(0)` / `nth(1)` | Selecionar o primeiro/segundo resultado; a contagem começa em zero. |
| `fill(valor)` / `click()` | Preencher o campo / clicar no elemento. |
| `request.post(..., { data })` | Enviar POST com corpo JSON. |
| `api.get(..., { params })` | Enviar GET com parâmetros na URL. |
| `response.status()` / `response.json()` | Obter o código HTTP / ler o corpo como objeto. |
| `toBe(200)` | Comparar com um valor exato. |
| `toEqual(objeto)` | Comparar todo o objeto com o esperado. |
| `toMatchObject(objeto)` | Comparar campos selecionados, permitindo outros campos na resposta. |
| `toBeVisible()` | Esperar que o elemento esteja visível. |
| `toHaveCount(0)` | Esperar que nenhum elemento corresponda ao seletor. |
| `waitForResponse(...)` | Esperar uma resposta de rede que corresponda ao filtro. |
| `waitForEvent('dialog')` | Esperar o alerta do navegador. |
| `dialog.accept()` | Fechar o alerta como ao clicar em OK. |

Nos botões de curtida, o emoji faz parte do nome acessível. Por isso o seletor usa `/Curtir$/` ou `/Curtido$/`: o texto precisa aparecer no final, podendo ter um emoji antes.

As esperas por alertas e respostas de rede são registradas **antes** do clique que as provoca. Isso evita perder um evento rápido. No alerta, o clique só é aguardado até o fim depois de aceitar a janela, pois ela bloqueia a interação.

## 7. Executar na apresentação

Com as dependências e o Chromium já instalados, abra o terminal:

```powershell
cd 'C:\casos de testes\sqa-social-media\tests'

# Mostrar a lista dos 8 casos, sem executá-los.
npm run test:list

# Conferir os tipos dos arquivos TypeScript.
npm run typecheck

# Executar tudo, com os servidores iniciados automaticamente.
# --headed mostra o navegador; --workers=1 facilita acompanhar um caso por vez.
npm run test:local -- --headed --workers=1

# Abrir o relatório HTML gerado pela execução.
npm run report
```

`test:local` usa API na porta 8081, frontend na 3001 e H2 em memória. O script `scripts/test-local.cjs` ativa esse modo e repassa as opções para o Playwright. A configuração inicia os servidores e espera estarem disponíveis; ao terminar a execução, o Playwright os encerra. O banco é temporário. As portas precisam estar livres, o frontend deve ter suas dependências instaladas e o backend precisa acessar a DummyJSON para os testes de curtidas.

Para demonstrar só o cadastro, com o navegador visível:

```sh
npm run test:local -- --project=e2e --grep E2E-01 --headed --workers=1
```

Para demonstrar só a falha encontrada:

```sh
npm run test:local -- --project=e2e --grep E2E-02 --headed --workers=1
```

Cada execução atualiza o relatório. Para mostrar o resultado de todos os casos juntos, abra o relatório após executar a suíte completa.

## 8. Explicar a falha ao professor

> A execução registrada teve 7 casos aprovados e 1 falha. O teste de login conseguiu entrar, mas a sessão se perdeu após recarregar. A inspeção do código mostrou que o usuário é salvo em uma chave do localStorage e recuperado de outra. O teste continua exigindo a manutenção da sessão, então registra o defeito.

O arquivo `RESULTADOS.md` registra a reprodução, o resultado esperado e o obtido. No relatório HTML, abra E2E-02 para ver o erro, o screenshot e o trace. O teste espera o botão `Sair`; a tela obtida mostra `Entrar` e `Criar Conta`.

A identificação do defeito vem do fluxo observado. A leitura posterior do código ajuda a explicar a causa, sem alterar a natureza do teste E2E.

## 9. Perguntas que podem surgir

**Por que usar e-mail aleatório?** Para impedir que um cadastro de outro caso ou execução cause conflito. O teste de duplicidade repete o mesmo e-mail intencionalmente dentro do próprio caso.

**Por que validar tela e API na curtida?** O botão pode mudar visualmente antes da confirmação do backend. A consulta HTTP verifica que a mudança também pode ser observada pelo endpoint de posts curtidos.

**O banco H2 é um mock?** É um banco real em memória. A API continua usando seus controllers, services e repositórios. Essa execução valida o comportamento com H2; o modo tradicional permite repetir os testes com MySQL.

**Por que os campos não usam getByLabel?** Os labels atuais da aplicação não estão associados aos inputs por `htmlFor`/`id`. Os testes usam placeholder e tipo do input, limitados ao formulário.

**Por que o processo retorna 1?** Porque um caso falhou. O script mantém o código de saída do Playwright para comunicar o resultado ao terminal e a uma eventual integração contínua.

**O que é uma fixture?** É um recurso preparado para o teste. `page` é fornecido pelo Playwright. A fixture `api` foi criada para fornecer aos E2E um cliente HTTP apontando ao backend e liberar esse cliente ao terminar o caso.

**Por que não apagar os usuários no final?** A API não oferece exclusão de usuário. No modo local, todo o banco temporário é descartado ao encerrar a API. No modo tradicional, os dados criados permanecem no banco de desenvolvimento.
