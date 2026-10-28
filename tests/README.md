# Testes E2E e de API — SQA Social Media

> Atividade 4: a suíte anterior foi preservada e os defeitos de senha, labels, preparação de mocks e persistência da sessão foram corrigidos para a integração contínua. `RESULTADOS.md` e os roteiros de gravação mantêm o histórico das atividades anteriores. O workflow atual está em `.github/workflows/ci.yml`.

Projeto independente de testes em TypeScript com Playwright, criado do zero pelo instalador oficial. As aplicações em `../api` e `../client` são testadas em execução. Os testes usam somente HTTP e a interface do navegador: não importam código das aplicações, não acessam o banco diretamente e não interceptam respostas com mocks.

Para uma explicação rápida de onde está cada teste e como funciona, leia o [resumo dos testes](./RESUMO-DOS-TESTES.md). Para estudar cada etapa e demonstrar ao professor, siga o [roteiro de apresentação](./APRESENTACAO.md). Os arquivos de configuração, testes, auxiliares e execução local têm comentários explicativos em português.

Para a entrega em vídeo, use o [roteiro de gravação](./ROTEIRO-GRAVACAO.md), com os arquivos na ordem de abertura, ações na tela, comandos e sugestões do que falar.

## Configuração inicial

O projeto foi iniciado na raiz do repositório com:

```sh
npm init playwright@latest -- tests --quiet --lang=TypeScript --browser=chromium --no-examples --no-browsers
```

As opções selecionam TypeScript e Chromium, dispensam exemplos prontos e deixam a instalação do navegador para uma etapa separada. A configuração gerada foi adaptada para dois projetos: `api` e `e2e`.

Para instalar a partir deste repositório:

```sh
cd tests
npm ci
npm run install:browsers
```

Pré-requisitos: Node.js 22+, npm e Java 17+ para iniciar a API. O modo tradicional também exige MySQL configurado em `api/src/main/resources/application.properties`. Instale as dependências do frontend com `npm ci` em `client`. Os testes de curtidas exigem acesso à DummyJSON pela API.

## Executar com a aplicação já em execução

Inicie a API em um terminal, na pasta `api`:

```sh
# Windows
.\mvnw.cmd spring-boot:run

# Linux/macOS
./mvnw spring-boot:run
```

Inicie o frontend em outro terminal, na pasta `client`:

```sh
npm run dev
```

Em `tests`, execute:

```sh
npm test
npm run test:api
npm run test:e2e
```

Por padrão, a API deve estar em `http://localhost:8080` e o frontend em `http://localhost:3000`. O frontend precisa apontar para a mesma API, por meio de `NEXT_PUBLIC_BASE_URL`.

Para mudar os endereços no PowerShell:

```powershell
$env:API_BASE_URL = 'http://localhost:8080'
$env:CLIENT_BASE_URL = 'http://localhost:3000'
npm test
```

Em Linux/macOS:

```sh
API_BASE_URL=http://localhost:8080 CLIENT_BASE_URL=http://localhost:3000 npm test
```

Os testes criam usuários com e-mails aleatórios `qa-<UUID>@example.com`; cada caso prepara os próprios dados e pode ser executado isoladamente ou em paralelo. Como a API não oferece exclusão de usuários, eles permanecem no banco no modo tradicional. Use um banco de desenvolvimento dedicado ou o modo temporário abaixo.

## Executar com servidores e banco temporários

Em `tests`:

```sh
npm run test:local
```

Esse comando inicia a API em `http://localhost:8081` e o frontend em `http://localhost:3001`, executa os 8 testes e encerra os servidores. As portas devem estar livres. O banco H2 fica em memória e seus dados são descartados quando a API termina. O driver H2 já existe nas dependências de teste da API; `spring-boot.run.useTestClasspath=true` o disponibiliza em execução. Esse modo executa a aplicação real e mantém as configurações locais de MySQL intactas.

Também é possível filtrar casos:

```sh
npm run test:local -- --project=api
npm run test:local -- --project=e2e --headed
```

O modo local inicia ambos os servidores mesmo ao filtrar somente a API. Para testar apenas uma API já em execução, use `npm run test:api`.

## Cenários implementados

| ID | Tipo | Fluxo e verificações principais |
| --- | --- | --- |
| E2E-01 | Navegador | Cadastro pelo formulário, acesso ao feed, confirmação do usuário pela API e logout. |
| E2E-02 | Navegador | Login com usuário previamente cadastrado, acesso ao feed e manutenção da sessão após recarregar. |
| E2E-03 | Navegador | Alerta ao tentar curtir sem login e ausência de requisição de curtida; login, curtida, consulta em Posts Curtidos, descurtida e confirmação da remoção pela API. |
| API-01 | HTTP | Cadastro válido: HTTP 200, JSON, ID positivo e possibilidade de login com os mesmos dados. |
| API-02 | HTTP | Cadastro duplicado: HTTP 409 e mensagem de e-mail em uso. |
| API-03 | HTTP | Login válido: HTTP 200 e identificação do usuário cadastrado. |
| API-04 | HTTP | Senha incorreta, mas com formato válido: HTTP 401 e mensagem de credenciais inválidas. |
| API-05 | HTTP | E-mail sem arroba: HTTP 422 e mensagem de e-mail inválido. |

As senhas de preparação atendem às validações atuais do frontend e backend. Os testes de erros verificam tanto o status HTTP quanto o corpo retornado. Cada teste do navegador começa com um contexto limpo e faz login pela interface, sem injetar sessão no localStorage. Os seletores usam botões e títulos por papel/texto e campos do formulário por placeholder e tipo. Os labels também foram associados aos inputs na consolidação dos testes.

## Relatório e depuração

```sh
npm run report
npm run test:ui
npm run test:headed
npm run test:list
npm run typecheck
```

O relatório HTML fica em `playwright-report/index.html`. Falhas geram screenshots, contexto de erro e traces em `test-results/`. Para abrir um trace, execute `npx playwright show-trace <caminho-do-trace.zip>`. Esses artefatos e `node_modules` são ignorados pelo Git.

Não há `test.skip`, `test.fail` nem tentativas automáticas: uma regressão faz a execução terminar com código diferente de zero. Consulte [RESULTADOS.md](./RESULTADOS.md) para a execução verificada e o defeito encontrado.

## Estrutura

```text
tests/
  api/auth.spec.ts             # 5 testes de API
  e2e/user-flows.spec.ts       # 3 testes E2E
  support/fixtures.ts          # Contexto HTTP separado para os E2E
  support/users.ts             # Dados exclusivos e preparação via API
  scripts/test-local.cjs       # Execução com servidores temporários
  playwright.config.ts
  tsconfig.json
  package.json
  package-lock.json
```

## Referências oficiais

- [Instalação do Playwright](https://playwright.dev/docs/intro)
- [Testes de API com Playwright](https://playwright.dev/docs/api-testing)
- [Servidores locais no Playwright](https://playwright.dev/docs/test-webserver)
- [Plugin Maven do Spring Boot e useTestClasspath](https://docs.spring.io/spring-boot/3.4/maven-plugin/run.html)
