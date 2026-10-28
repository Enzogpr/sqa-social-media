# Resumo dos testes

> Continuidade na Atividade 4: os oito casos anteriores continuam ativos; o defeito de sessão descrito ao final foi corrigido. A mensagem atual de e-mail duplicado é “E-mail já cadastrado”.

O projeto usa **Playwright** e possui **8 testes: 5 de API e 3 E2E**.

**API:** envia pedidos diretamente ao backend e confere as respostas.
**E2E:** abre o navegador, preenche campos e clica nos botões como um usuário.

## Os 5 testes de API

Todos estão no arquivo **`tests/api/auth.spec.ts`**, dentro da pasta do projeto `sqa-social-media`.

| Teste | O que verifica | Como funciona |
| --- | --- | --- |
| **API-01 — Cadastro válido** | Se é possível criar uma conta e usar seus dados para entrar. | Envia e-mail novo e senha válida para `/auth/signup`. Confere sucesso **200**, resposta JSON e ID positivo. Depois faz login em `/auth/signin` e confere o mesmo usuário. |
| **API-02 — E-mail duplicado** | Se o sistema impede duas contas com o mesmo e-mail. | Cadastra um usuário e tenta cadastrá-lo novamente. Espera **409** e a mensagem “E-mail já está em uso”. |
| **API-03 — Login válido** | Se o sistema permite entrar com os dados corretos. | Cria um usuário para o teste e envia seu e-mail e senha para `/auth/signin`. Espera **200** e o ID/e-mail desse usuário. |
| **API-04 — Senha incorreta** | Se o sistema recusa o login com senha errada. | Cria um usuário e tenta entrar com o e-mail correto e outra senha. Espera **401** e a mensagem “Credenciais inválidas”. |
| **API-05 — E-mail inválido** | Se o cadastro rejeita um e-mail sem arroba. | Envia um e-mail sem `@` e uma senha válida para `/auth/signup`. Espera **422** e a mensagem “E-mail inválido”. |

## Os 3 testes E2E

Todos estão no arquivo **`tests/e2e/user-flows.spec.ts`**.

| Teste | O que verifica | Como funciona |
| --- | --- | --- |
| **E2E-01 — Cadastro e saída** | O fluxo de criar uma conta e sair dela. | Abre o site, clica em “Criar Conta”, preenche e envia o formulário. Confirma o feed e o botão “Sair”, verifica o cadastro pela API e faz logout. Ao final, deve aparecer “Entrar”. |
| **E2E-02 — Login e recarga** | Se o usuário continua conectado após atualizar a página. | Prepara uma conta pela API, faz login pelo navegador e confirma o feed. Recarrega a página e espera que os botões “Sair” e “Posts Curtidos” continuem disponíveis. |
| **E2E-03 — Curtidas** | O bloqueio da curtida sem login e o fluxo de curtir/descurtir após entrar. | Tenta curtir sem login, confere o alerta e verifica que nenhuma requisição de curtida foi enviada. Depois faz login, curte um post, abre “Posts Curtidos” e descurte. Confere as mudanças na tela e pela API. |

## Como ler o código

Todos os casos seguem a ideia: **preparar os dados → realizar a ação → conferir o resultado**.

- `test(...)`: define um teste; seu nome começa com o ID mostrado nas tabelas.
- `expect(...)`: confere se o resultado é o esperado; se não for, o teste falha.
- `await`: espera uma operação terminar antes de continuar.
- `request.post(...)`: envia dados para a API.
- `page.goto(...)`, `fill(...)` e `click()`: abrem a página, preenchem campos e clicam.

Os arquivos `tests/support/users.ts` e `tests/support/fixtures.ts` ajudam a preparar os dados e as chamadas HTTP. Os e-mails são exclusivos para os testes não dependerem uns dos outros. Preparar uma conta pela API não faz login no navegador.

## Como executar

Com as dependências e o Chromium instalados, abra o terminal na pasta `tests`:

```sh
npm run test:local
```

O comando inicia a aplicação com banco temporário, executa os testes e encerra os servidores. Para acompanhar os E2E com o navegador visível, um caso por vez:

```sh
npm run test:local -- --headed --workers=1
```

**Resultado registrado em 12/10/2026:** 7 aprovados e 1 falha. O **E2E-02** encontrou um defeito: a aplicação perde o login ao recarregar a página. O teste registra esse problema ao exigir que a sessão continue ativa.
