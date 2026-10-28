# Integração contínua da Atividade 4

## Organização

A branch `main` consolida os testes das atividades anteriores e a configuração da esteira. A funcionalidade de contadores deve ser desenvolvida na branch `feature/likes-dislikes`, com Pull Request aberto para a `main` do próprio fork.

O workflow é `.github/workflows/ci.yml`. O evento `pull_request`, filtrado para `main`, executa quando o PR é aberto, atualizado com novos commits, reaberto ou marcado como pronto para revisão. Pushes na `main` e execução manual também são suportados.

## Jobs

| Job | Preparação e verificações |
| --- | --- |
| API - unidade e integracao | Java 17 e Maven Wrapper; `verify` executa os testes JUnit/Mockito/MockMvc e empacota a API. |
| Cliente - unidade, integracao e build | Node.js 22, `npm ci`, Jest com cobertura e build Next.js com verificação de tipos. |
| Playwright - API e E2E | Após os dois jobs anteriores, instala dependências e Chromium com bibliotecas Linux, confere os tipos e executa os testes de caixa-preta. |

No job Playwright, `test:local` ativa o `webServer` configurado no Playwright, inicia a API com banco H2 em memória e o frontend, aguarda ambos responderem e executa a suíte. O H2 é um banco real e descartável; a aplicação continua consumindo a DummyJSON pela rede. O ambiente da pipeline não depende do MySQL do computador do aluno.

Os comandos falham se algum teste ou o build falhar. Nenhum teste anterior foi removido ou marcado para ignorar erros. Os relatórios Java, a cobertura do cliente e as evidências Playwright são enviados como artefatos, inclusive em falhas, e mantidos por 14 dias.

## Consolidação da suíte anterior

Antes da feature, em 28/10/2026, foram aprovados localmente:

- 6 testes Java;
- 6 testes Jest;
- 5 testes de API e 3 E2E com Playwright;
- build de produção do frontend.

Foram corrigidos os comportamentos detectados pelos testes: mínimo de oito caracteres e pontuação nas senhas, tratamento de cadastro sem campos obrigatórios, associação entre labels e inputs e persistência do login. O teste MVC de login teve o mock preparado corretamente, e os testes de formulário passaram a selecionar o botão da área principal. A mensagem de e-mail duplicado acompanha o contrato atual da `main`: “E-mail já cadastrado”.

## Conferir a entrega no GitHub

1. Abrir o repositório do fork e entrar em **Pull requests**.
2. Confirmar que o PR da feature tem `main` como destino e está aberto.
3. Conferir a aba **Checks** no último commit do PR: os três jobs precisam terminar com sucesso.
4. Pela aba **Actions**, abrir a execução para consultar logs e artefatos.
5. Enviar somente o link do repositório, conforme o enunciado. Manter o PR aberto para avaliação.

Uma validação local não substitui a execução no GitHub Actions: a entrega exige a execução remota verde vinculada ao PR.

## Feature de likes e dislikes

Os contadores seguem o contrato do DummyJSON: `reactions.likes` e `reactions.dislikes`. A API preserva esse objeto ao montar os posts do feed e dos posts curtidos, e o tipo `Post` do frontend declara os dois números. O `PostCard`, usado na Home, exibe ambos os valores, inclusive zero.

O campo `liked` continua representando a curtida pessoal do usuário na aplicação. Os números em `reactions` são os valores globais recebidos do DummyJSON; clicar no botão de curtida pessoal não envia alterações para a API externa.

A feature acrescenta sete casos, mantendo todos os anteriores:

- 3 testes Java de `PostService`: preservação dos dois números, ausência de `reactions` com padrão zero e contrato dos posts curtidos;
- 2 testes Jest de `PostCard`: números diferentes e contadores iguais a zero;
- 1 teste de API Playwright que compara o feed com a DummyJSON real;
- 1 E2E que confere os contadores em todos os cards carregados na Home.

Isso totaliza **9 testes Java, 8 testes Jest, 6 testes de API e 4 E2E**. Os testes unitários do serviço usam respostas HTTP controladas para verificar valores conhecidos. Os testes Playwright usam o backend e a DummyJSON reais.

Em 28/10/2026, os 27 casos e o build do frontend passaram localmente. O E2E dos contadores também salva uma captura da Home no relatório Playwright, disponível nos artefatos da CI.
