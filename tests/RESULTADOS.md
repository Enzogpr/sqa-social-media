# Resultado da execução

> Registro histórico da Atividade 3. Na Atividade 4, a persistência de sessão foi corrigida sem retirar a verificação do E2E-02. O resultado abaixo descreve a execução de 12/10/2026 e não representa o estado atual da pipeline.

Execução verificada em **12/10/2026**, no Windows, com Node.js 22.18.0, Java 17, Playwright 1.64.0 e Chromium. A API Spring Boot e o frontend Next.js foram iniciados pelo Playwright em portas separadas, usando H2 em memória e a integração real com DummyJSON.

Comando executado na pasta `tests`:

```sh
npm run test:local
```

Resultado: **8 testes executados, 7 aprovados e 1 falha**, sem casos ignorados ou marcados como falha esperada. A suíte terminou com código de saída **1**, indicando a regressão detectada.

| Caso | Resultado |
| --- | --- |
| API-01 — cadastro válido e confirmação por login | Aprovado |
| API-02 — e-mail duplicado | Aprovado |
| API-03 — login válido | Aprovado |
| API-04 — senha incorreta | Aprovado |
| API-05 — e-mail inválido | Aprovado |
| E2E-01 — cadastro, feed e logout | Aprovado |
| E2E-02 — login e sessão após recarregar | Falhou |
| E2E-03 — curtida anônima bloqueada, login, curtida e descurtida | Aprovado |

Também foram verificados `npm run typecheck` e `npm run test:list`: a configuração TypeScript passou e o Playwright reconheceu exatamente 3 testes E2E e 5 testes de API.

## Defeito encontrado: sessão perdida ao recarregar

**Reprodução:**

1. Cadastrar um usuário válido.
2. Fazer login pelo formulário em `/signin`.
3. Confirmar que o feed mostra os botões `Sair` e `Posts Curtidos`.
4. Recarregar a página.

**Esperado:** a sessão permanece ativa e os botões autenticados continuam disponíveis.

**Obtido:** o cabeçalho passa a mostrar `Entrar` e `Criar Conta`. O teste falha ao esperar pelo botão `Sair` após `page.reload()`.

**Causa identificada na inspeção do código:** em `client/src/lib/localStorage.ts`, `saveUser` grava na chave `user`, enquanto `getUser` e `removeUser` usam `sqa_social_user`. Assim, o `AuthProvider` não recupera o usuário salvo ao carregar a aplicação novamente.

**Evidências:** o relatório HTML em `playwright-report/index.html`, o screenshot e o trace em `test-results/` registram a falha. Esses arquivos são locais e ignorados pelo Git; uma nova execução os gera novamente. Para visualizar o relatório:

```sh
npm run report
```

As aplicações não foram alteradas para corrigir esse defeito. O teste permanece ativo e exige o comportamento esperado; nenhuma sessão é injetada no navegador para contornar o problema.

## Limites da execução

- O backend foi validado com H2 em memória nesta execução. O modo tradicional permite repetir os mesmos testes com a configuração MySQL do ambiente.
- Os casos de curtidas dependem da disponibilidade da DummyJSON e do acesso à internet do backend.
- O fluxo de cadastro e as curtidas usam dados novos em cada teste. No banco temporário, os dados desaparecem ao encerrar a API.
