# Roteiro de gravação — testes de API e E2E

> Roteiro histórico da Atividade 3. A Atividade 4 substitui a entrega por vídeo pelo link do repositório, com PR aberto e pipeline verde. O defeito de sessão demonstrado aqui foi corrigido durante a consolidação da suíte.

**Duração sugerida:** 10 a 12 minutos, sem contar esperas longas de inicialização. As falas são sugestões em linguagem simples: ensaie e adapte ao seu jeito de explicar.

Em cada etapa, **NA TELA** indica o que abrir e apontar; **FALE** é a sugestão de fala. As instruções de tela não precisam ser lidas em voz alta.

## Antes de começar a gravar

1. Abra a pasta `C:\casos de testes\sqa-social-media` no editor e aumente a fonte até o código ficar legível no vídeo.
2. Deixe disponíveis o editor, um terminal PowerShell e o navegador para o relatório. Grave a tela com o áudio do microfone.
3. Faça um ensaio com o comando da etapa 8. Aguarde terminar antes de executar novamente; o modo local precisa das portas 8081 e 3001 livres.
4. Se faltar o navegador, execute `npm run install:browsers` na pasta `tests` antes da gravação. As dependências de `client` e `tests` também precisam estar instaladas, conforme o README.
5. Use o resultado da execução que você vai mostrar. A contagem de aprovados e falhas deve corresponder ao terminal e ao relatório exibidos.

**Se aparecer “localhost:3001 is already used”:** há um servidor ou uma execução anterior usando essa porta. Vá ao terminal em que esse processo foi iniciado, encerre-o com `Ctrl+C`, aguarde terminar e repita o ensaio. O modo local inicia seus próprios servidores e exige as portas disponíveis.

### Arquivos para deixar abertos, nesta ordem

Os caminhos abaixo partem da raiz `sqa-social-media`. Em editores com abertura rápida, use `Ctrl+P` e digite o caminho da coluna Arquivo.

| Ordem | Arquivo | O que mostrar |
| --- | --- | --- |
| 1 | [tests/package.json](<C:/casos de testes/sqa-social-media/tests/package.json>) | Playwright instalado e comandos de execução. |
| 2 | [tests/playwright.config.ts](<C:/casos de testes/sqa-social-media/tests/playwright.config.ts>) | Grupos API/E2E, navegador, relatório e servidores. |
| 3 | [tests/support/users.ts](<C:/casos de testes/sqa-social-media/tests/support/users.ts>) | Dados exclusivos e cadastro de preparação. |
| 4 | [tests/support/fixtures.ts](<C:/casos de testes/sqa-social-media/tests/support/fixtures.ts>) | Cliente HTTP usado pelos E2E. |
| 5 | [tests/api/auth.spec.ts](<C:/casos de testes/sqa-social-media/tests/api/auth.spec.ts>) | Os 5 testes de API. |
| 6 | [tests/e2e/user-flows.spec.ts](<C:/casos de testes/sqa-social-media/tests/e2e/user-flows.spec.ts>) | Os 3 testes no navegador. |
| 7 | [tests/scripts/test-local.cjs](<C:/casos de testes/sqa-social-media/tests/scripts/test-local.cjs>) | Inicialização do modo local. |
| 8 | [client/src/lib/localStorage.ts](<C:/casos de testes/sqa-social-media/client/src/lib/localStorage.ts>) | Causa do defeito de sessão, após mostrar a falha. |

## 1. Apresentação do trabalho — cerca de 30 segundos

**NA TELA:** mostre a árvore do projeto com as pastas `api`, `client` e `tests`.

**FALE:**

> “Neste vídeo vou apresentar os testes automatizados do projeto SQA Social Media. O projeto tem uma API em Spring Boot e uma interface em Next.js. Na pasta tests estão cinco testes de API e três testes E2E, feitos com Playwright e TypeScript. Vou mostrar a organização do código, explicar os casos e executar os testes.”

> “Nos testes de API, as chamadas são enviadas diretamente ao backend. Nos E2E, o Playwright controla uma aba de navegador real e percorre os fluxos pela interface.”

## 2. Ferramenta e comandos — cerca de 40 segundos

**ABRA:** `tests/package.json`.

**NA TELA:** aponte `@playwright/test` em `devDependencies` e os comandos `test:local` e `report` em `scripts`.

**FALE:**

> “O Playwright está instalado como dependência de desenvolvimento deste projeto de testes. A ferramenta foi escolhida porque foi apresentada em aula e permite testar tanto a API quanto a interface no mesmo projeto.”

> “Os scripts são atalhos para executar os comandos. O test:local prepara a execução com servidores locais e banco temporário. O comando report abre o relatório HTML com o resultado dos casos.”

**FAÇA:** apenas aponte os comandos agora. A execução será mostrada na etapa 8.

## 3. Configuração — cerca de 1 minuto

**ABRA:** `tests/playwright.config.ts`.

**NA TELA:** procure `projects`, depois `reporter`, `trace`, `screenshot` e `webServer`.

**FALE:**

> “Este arquivo centraliza a configuração. Aqui em projects há dois grupos: api, que encontra os testes da pasta api e usa o endereço do backend; e e2e, que encontra os testes da pasta e2e e usa o endereço do frontend. O navegador escolhido para os E2E é o Chromium.”

> “O relatório aparece no terminal e também é gerado em HTML. Quando um teste falha, a configuração guarda uma captura da tela e um trace, que permite investigar as ações e a rede.”

**NA TELA:** aponte `START_SERVERS`, `SPRING_DATASOURCE_URL` e `create-drop` no mesmo arquivo.

**FALE:**

> “O modo local ativa a inicialização dos servidores. Para essa execução, a API usa H2 em memória: um banco real e temporário. Os cadastros e as curtidas são gravados nele, e os dados são descartados ao encerrar. O frontend continua chamando a API real.”

**LEMBRETE:** neste arquivo, os endereços padrão são 8080 e 3000. O script do modo local passa 8081 e 3001. Essa diferença será mostrada na etapa 7.

## 4. Preparação dos testes — cerca de 50 segundos

**ABRA:** `tests/support/users.ts`.

**NA TELA:** aponte `newCredentials()`, `randomUUID()` e `createUser()`.

**FALE:**

> “Este arquivo reúne funções auxiliares criadas para os testes. newCredentials gera um e-mail exclusivo e uma senha válida. O identificador aleatório no e-mail evita conflito com outros casos ou execuções. createUser usa esses dados para cadastrar um usuário pelo endpoint público e confere se a preparação funcionou.”

**ABRA:** `tests/support/fixtures.ts`.

**NA TELA:** aponte `base.extend`, `newContext`, `use(api)` e `dispose()`.

**FALE:**

> “Uma fixture é um recurso preparado para o teste. Aqui foi acrescentado o recurso api aos testes E2E. Ele fornece um cliente HTTP apontando para o backend, entrega esse cliente ao caso e libera os recursos ao terminar. Isso permite preparar usuários e conferir resultados pela API. Cadastrar um usuário dessa forma não faz login na aba do navegador.”

## 5. Código dos testes de API — cerca de 2 minutos

**ABRA:** `tests/api/auth.spec.ts`.

**NA TELA:** comece pelos imports e pelo `test.describe`. Depois destaque o caso `API-02`.

**FALE:**

> “Este arquivo contém os cinco testes de API. test e expect vêm do Playwright. test registra cada caso e suas etapas. expect compara o resultado obtido com o esperado. Já createUser e newCredentials são os auxiliares do nosso projeto.”

> “O Playwright fornece request para enviar as chamadas HTTP. O async e o await permitem esperar a resposta antes de continuar as verificações. Os casos seguem a sequência preparar, agir e validar.”

**NA TELA:** no API-02, aponte os três trechos, nesta ordem:

```ts
const user = await createUser(request);
```

**FALE:**

> “Primeiro preparo um usuário que já existe no sistema.”

```ts
const response = await request.post('/auth/signup', {
  data: { email: user.email, password: user.password },
});
```

**FALE:**

> “Depois tento cadastrar novamente o mesmo e-mail. O data é enviado como corpo JSON da requisição POST.”

```ts
expect(response.status()).toBe(409);
expect(await response.json()).toEqual({ message: 'E-mail já está em uso', status: 409 });
```

**FALE:**

> “Por fim, espero o código 409 e a mensagem de e-mail em uso. O teste passa quando a API recusa corretamente a duplicidade. Aqui receber um erro esperado faz parte do sucesso do teste.”

**NA TELA:** percorra os nomes dos outros casos, sem ler todas as linhas.

**FALE:**

> “O API-01 verifica cadastro válido e confirma que os dados permitem fazer login. O API-03 testa o login válido e a identidade retornada. O API-04 usa um e-mail cadastrado e uma senha incorreta, esperando 401. O API-05 envia um e-mail sem arroba, esperando 422. Além do status, os casos verificam os dados ou as mensagens retornadas.”

> “Esses testes são de caixa preta porque usam os endpoints públicos e observam as respostas, sem chamar diretamente os métodos internos dos serviços.”

## 6. Código dos testes E2E — cerca de 2 minutos e meio

**ABRA:** `tests/e2e/user-flows.spec.ts`.

**NA TELA:** mostre o import de `../support/fixtures`, o início do E2E-01 e suas etapas numeradas.

**FALE:**

> “Neste arquivo estão os três fluxos no navegador. O test vem da versão estendida que mostrei em fixtures. O Playwright fornece page, que representa uma aba real do navegador, e a nossa fixture acrescenta api. Cada caso começa com um contexto de navegador limpo.”

### E2E-01: cadastro e logout

**NA TELA:** aponte `page.goto`, `getByRole`, `fill`, `click` e as verificações finais.

**FALE:**

> “O primeiro caso abre a página inicial, clica em Criar Conta, preenche o formulário e envia o cadastro. page.goto navega; getByRole localiza um elemento pelo papel e nome; fill preenche; click clica. O teste confirma o feed e o botão Sair, verifica pela API se a conta permite login e encerra com logout.”

> “Os expects verificam o resultado. Por exemplo, toBeVisible espera que o elemento esteja visível. Portanto, o teste não verifica apenas se houve um clique: ele confere o efeito da ação.”

### E2E-02: login e recarga

**NA TELA:** aponte `createUser(api)`, o preenchimento do login, `page.reload()` e o `expect` logo depois.

**FALE:**

> “O segundo caso prepara uma conta pela API e faz login pela interface. Primeiro confirma que o login funcionou. Depois recarrega a página, como um F5, e verifica se a sessão continua ativa. Essa etapa detectou a perda de sessão na execução registrada.”

### E2E-03: curtidas

**NA TELA:** percorra os comentários numerados. Pare em `waitForEvent('dialog')`, `waitForResponse` e na consulta de posts curtidos.

**FALE:**

> “O terceiro caso começa sem login e tenta curtir um post. Ele verifica o alerta e confirma que a interface não enviou uma requisição de curtida. Depois faz login, curte o post, entra em Posts Curtidos e descurte.”

> “Antes de clicar, o teste já começa a esperar o alerta ou a resposta da rede, para não perder um evento rápido. Ele confere a mudança visual e também consulta a API, porque o botão mudar de aparência não garante, sozinho, que a curtida foi persistida.”

**LEMBRETE:** esse trecho verifica o bloqueio da curtida anônima pela interface. Não apresente isso como uma comprovação de proteção de todos os endpoints contra acesso não autorizado.

## 7. Explicar o comando de execução — cerca de 30 segundos

**ABRA:** `tests/scripts/test-local.cjs`.

**NA TELA:** aponte `spawn`, `START_SERVERS`, as duas URLs e `process.argv.slice(2)`.

**FALE:**

> “Este script inicia o executor do Playwright com as variáveis do modo local. Ele ativa os servidores e usa a API na porta 8081 e a interface na 3001. Os argumentos extras são repassados ao Playwright. Vou usar headed para mostrar o navegador e workers igual a um para executar os casos um de cada vez.”

## 8. Demonstrar a execução — tempo variável

**NA TELA:** abra o PowerShell e execute:

```powershell
cd 'C:\casos de testes\sqa-social-media\tests'
npm run test:local -- --headed --workers=1
```

**FALE enquanto os servidores iniciam:**

> “O comando primeiro inicia o backend e o frontend e espera os dois responderem. Depois começa os testes. Por isso pode haver uma espera antes de aparecer a lista de resultados.”

**FAÇA:** se essa inicialização demorar, você pode pausar a gravação ou cortar parte da espera. Mostre a continuação da mesma execução quando aparecer `Running 8 tests`.

**NA TELA:** mostre os resultados de API no terminal e passe para a janela do Chromium quando os E2E começarem.

**FALE:**

> “Os testes de API aparecem no terminal, sem precisar abrir uma página. Nos E2E, o navegador está sendo controlado pelo Playwright. O preenchimento e os cliques são feitos pelo código que mostrei.”

**FAÇA durante os E2E:** acompanhe sem clicar ou digitar na janela automatizada. As ações podem ser rápidas; explique as etapas no código antes da execução, sem depender de narrar cada clique ao vivo.

**NA TELA:** ao terminar, mostre o resumo no terminal. Só então execute o comando da etapa 9.

**FALE conforme o resultado exibido:**

> “Nesta execução foram executados oito testes: [quantidade exibida] passaram e [quantidade exibida] falharam. Vou abrir o relatório para analisar o resultado.”

**ATENÇÃO AO TEXTO DA FALA:** substitua os colchetes pelos números do seu terminal. O registro histórico de 12/10/2026 teve sete aprovados e uma falha; isso não deve ser tratado como garantia de toda nova execução.

## 9. Mostrar o relatório — cerca de 45 segundos

**NA TELA:** no mesmo terminal, após a execução terminar:

```powershell
npm run report
```

Abra no navegador o endereço informado pelo comando, caso não abra automaticamente.

**FAÇA:** mostre os casos aprovados, selecione o E2E-02 se ele tiver falhado após a recarga e mostre a mensagem de erro e a captura de tela. Você também pode abrir o trace pelo relatório para mostrar as ações.

**FALE, se a falha for a perda de sessão:**

> “O relatório mostra a etapa em que o teste falhou. O login inicial funcionou, mas depois da recarga o teste esperava o botão Sair e ele não estava disponível. A captura mostra a tela obtida. Isso permite comparar o comportamento esperado com o que aconteceu.”

**SE APARECER OUTRO ERRO:** descreva o erro real. Falta do executável do Chromium é um problema de preparação do ambiente: instale com `npm run install:browsers` e repita o ensaio. Uma falha de rede ou da DummyJSON também deve ser investigada como tal; não a apresente como a mesma falha de sessão. Cada nova execução atualiza o relatório.

## 10. Explicar a causa do defeito — cerca de 40 segundos

**ABRA:** `client/src/lib/localStorage.ts`, depois de apresentar a evidência do E2E-02.

**NA TELA:** aponte a constante e as chamadas de gravação e leitura:

```ts
const USER_KEY = 'sqa_social_user';
```

```ts
localStorage.setItem("user", JSON.stringify(user));
```

```ts
const userData = localStorage.getItem(USER_KEY);
```

**FALE:**

> “Após o teste apontar a falha, a inspeção do código mostrou esta diferença: a aplicação salva os dados na chave user, mas tenta recuperá-los usando sqa_social_user. Por isso, ao recarregar, não encontra o usuário salvo e perde o estado de login.”

> “O teste encontrou o comportamento incorreto pela interface. A leitura desse arquivo foi uma investigação posterior para entender a causa.”

**FAÇA:** apenas mostre o código. Não é necessário editar a aplicação durante a demonstração.

## 11. Encerrar — cerca de 20 segundos

**NA TELA:** volte ao relatório da execução mostrada.

**FALE:**

> “O trabalho reúne cinco testes de API e três E2E. Eles verificam casos de sucesso, rejeição de entradas e fluxos completos pela interface. Os testes têm dados independentes e geram evidências para investigar os resultados. A execução também permite identificar problemas reais, como a perda de sessão após a recarga.”

## Cola rápida para deixar ao lado da tela

| Etapa | Abrir ou fazer | Ideia principal da fala |
| --- | --- | --- |
| 1 | Árvore do projeto | 5 API + 3 E2E, pasta tests. |
| 2 | `tests/package.json` | Playwright, TypeScript e comandos. |
| 3 | `tests/playwright.config.ts` | Dois grupos, Chromium, relatório e H2. |
| 4 | `tests/support/users.ts` e `tests/support/fixtures.ts` | Dados exclusivos e cliente HTTP. |
| 5 | `tests/api/auth.spec.ts` | test, request e expect; detalhar API-02 e citar os outros. |
| 6 | `tests/e2e/user-flows.spec.ts` | page real; cadastro, sessão e curtidas. |
| 7 | `tests/scripts/test-local.cjs` | Inicializa o modo local e repassa argumentos. |
| 8 | `npm run test:local -- --headed --workers=1` | Mostrar os 8 casos e o navegador. |
| 9 | `npm run report` | Mostrar resultado e evidência da falha. |
| 10 | `client/src/lib/localStorage.ts` | Chaves diferentes na gravação e leitura. |
| 11 | Relatório | Encerrar com o resultado efetivamente demonstrado. |

### Se precisar encurtar o vídeo

Mantenha a abertura, explique rapidamente a configuração, detalhe o API-02 e o E2E-01 e cite os demais casos pelo nome e objetivo. Preserve a execução e a análise do relatório. As explicações de auxiliares e do script local podem ser reduzidas a uma frase cada.

### Conferência deste roteiro

Em 24/10/2026, os arquivos e trechos foram conferidos no projeto, a verificação TypeScript passou e o Playwright listou exatamente oito casos. A tentativa de executar novamente a suíte parou na preparação porque a porta 3001 estava ocupada; os oito casos não foram revalidados nesta revisão. O resultado da demonstração deve ser lido da execução que aparecer no seu vídeo.
