# bios-webapp

🇧🇷 **Português** · 🇺🇸 [English](README.en.md)

[![CI](https://github.com/odavibatista/bios-webapp/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/odavibatista/bios-webapp/actions/workflows/ci.yml)

Front-end do **BIOS — Business Intelligence on Sustainability**, em Angular. Mostra, para cada empresa,
o índice de aderência aos **ODS 13 e 15**, a confiança e as evidências que o compõem, cada uma com a
referência à fonte oficial.

> **Versão de apresentação:** o app roda sem a API no ar. Os dados vêm de respostas reais do
> [bios-core-api](https://github.com/odavibatista/bios-core-api), capturadas e guardadas no repositório, atrás
> de um serviço com a mesma interface da API: integrar de verdade é trocar só esse serviço. Só dados de
> pessoa jurídica (INL02).

Requisitos e modelagem: [bios-docs](https://github.com/odavibatista/bios-docs).

## Stack

| Camada           | Tecnologia                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------- |
| Runtime          | Node.js 22.23.4 e npm 11, fixados pelo Volta (`volta` no `package.json`)                     |
| Framework        | Angular 22 (standalone, zoneless, signals), TypeScript 6 `strict` com `strictTemplates`      |
| Componentes      | Angular Material 3 e CDK, com tema gerado da paleta do BIOS                                  |
| Gráficos         | ECharts (`ngx-echarts`)                                                                      |
| Fontes e ícones  | Inter e Material Symbols servidos pelo próprio app (a apresentação funciona offline)         |
| Tipos da API     | `@hey-api/openapi-ts`, a partir do OpenAPI do bios-core-api (`api/openapi.json`)             |
| Testes unitários | Vitest (builder do Angular) e `@testing-library/angular`, cobertura mínima de 75%            |
| Testes e2e       | Playwright (Chromium)                                                                        |
| Qualidade        | Angular ESLint com lint por tipos, Prettier, Husky, lint-staged, commitlint e GitHub Actions |

## Início rápido

```bash
npm install          # dependências (com o Volta, Node e npm certos entram sozinhos)
npm start            # http://localhost:4200
```

| Script                                           | Função                                                                                  |
| ------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `start` / `build` / `watch`                      | Servidor de desenvolvimento, build de produção e build contínuo                         |
| `test` / `test:watch` / `test:cov`               | Testes unitários (uma vez, em modo contínuo, com cobertura)                             |
| `test:e2e`                                       | Testes e2e no Playwright (sobe o app sozinho; antes, `npx playwright install chromium`) |
| `lint` / `format` / `format:check` / `typecheck` | ESLint, Prettier e verificação de tipos                                                 |
| `api:types`                                      | Regenera os tipos de `src/app/core/api/generated` a partir de `api/openapi.json`        |
| `verify`                                         | Tipos, lint, testes com cobertura e build: o que o CI exige                             |

**Tipos da API.** O CI do bios-core-api publica o documento OpenAPI como artefato (`openapi`). Para
atualizar, substitua `api/openapi.json` por ele e rode `npm run api:types`.

**Acessibilidade e larguras nos e2e (NFIN01, NFIN02).** Os e2e rodam em 1280 px (`desktop`) e 390 px
(`celular`), e todo teste termina com a análise do axe (WCAG 2.0, 2.1 e 2.2, níveis A e AA) e com a
checagem de que a página não rola na horizontal. Os testes importam `test` e `expect` de
`e2e/support/test.ts`, que faz isso sozinho; uma tela intermediária pede `expectAccessible` no próprio
teste. A falha lista regra, impacto e elementos; o resultado completo de cada análise vai como anexo
"acessibilidade (axe)" no relatório do Playwright (`npx playwright show-report` localmente; no CI, o
artefato `playwright-report`).

**Acentuação dos textos (NFIN04).** `src/app/shared/portuguese-accents.spec.ts` lê o texto visível dos
templates (e os atributos que o leitor de tela anuncia, como `aria-label`) e as frases do código, e
reprova palavra sem acento da lista `UNACCENTED` (`nao`, `indice`, `pagina`...). Achou uma grafia nova
sem acento? Acrescente-a à lista.

**Caminho com parênteses no Windows.** O builder de testes do Angular passa ao Vitest o caminho
absoluto de cada spec sem escapar, e uma pasta como `7-SEM (2026-2)` faz o Vitest não achar nenhum
teste. O `npm test` contorna isso sozinho (`scripts/unit-test.mjs`: monta a pasta-mãe numa unidade
temporária com `subst` e desmonta no fim). Fora do Windows, ou sem esses caracteres no caminho, roda
direto.

## Camada de dados

As telas falam só com o contrato `BiosApi` (`src/app/core/api/bios-api.ts`): um método por operação do
OpenAPI usada pelo app, com entrada e saída dos tipos gerados. Falhas chegam como `ApiError` (`status`,
`code`, `message`, `details`), com o texto da API. O provedor é escolhido em `app.config.ts`; integrar
com a API real é trocar só ele.

**Sessão** (`src/app/core/session/`): o `SessionStore` guarda a sessão só em memória e fornece o
token ao provedor. Só a versão de apresentação fornece `TabStorage`, em que a sessão do mock sobrevive a
recarregar a página e acaba ao fechar a aba. O `BiosApi` que as telas recebem renova o
access token sozinho: um `401 NOT_AUTHENTICATED` com sessão aberta dispara um único `refreshSession`
(chamadas simultâneas esperam o mesmo) e repete a operação; se a renovação falhar, a sessão é apagada e
o app vai para `/entrar?voltar=<rota>&sessao=encerrada`. Toda rota é privada por padrão
(`privateByDefault`); as públicas se declaram com `data: { public: true }`.

Na versão de apresentação, o provedor é o `MockBiosApi` (`src/app/core/mocks/`):

- **Leitura** vem das respostas capturadas (perfis, explicações, setores, ODS); a pesquisa é refeita
  sobre os perfis capturados, e um teste confere que ela dá o mesmo resultado de cada pesquisa real
  capturada. As capturas carregam sob demanda (chunk `mock-data`), fora do bundle inicial.
- **O que a demo altera** (contas, sessões, links de e-mail, chaves de API, blacklist) fica na aba
  (`sessionStorage`), só com o resumo das senhas, e acaba ao fechá-la. Contas prontas: `apresentacao@example.com` (`USER`) e
  `administracao@example.com` (`ADMIN`), senha `Apresentacao2026`. Os links que os e-mails trariam ficam
  em `MockMailbox`.
- **Determinismo:** latência e cenários de falha (`forcedErrors`) vêm de `MOCK_API_CONFIG`, nunca de
  sorteio. O que a apresentação não reproduz (uma exportação não capturada, um setor fora da lista)
  responde `422 NOT_AVAILABLE_IN_PRESENTATION`, em vez de inventar dado.

## Painel

`/painel` é a tela para onde o login leva (UC18, RF34): a busca e as empresas cujo índice mudou por
último, em cartões que abrem o perfil. Cada cartão mostra, por ODS, o índice e a confiança atuais e o
sentido, a causa e a data da mudança, nunca o índice anterior ou a variação (IND03). A ordem é só
cronológica, e a página fica na URL (`?pagina=2`), para o "voltar" devolver à mesma página.

As rotas privadas moram na casca do painel (`src/app/layout/`): menu lateral fixo em tela larga e
gaveta em tela estreita, com o item atual marcado por `aria-current`. O menu vem de `PANEL_NAV`
(`panel-nav.ts`), filtrado pelo papel; só o `ADMIN` vê a administração. A barra do topo mostra quem
entrou (nome e e-mail da conta, papel da sessão). As rotas de `/admin` pedem o papel com
`requireRole('ADMIN')`: o `USER` vai para `/acesso-negado`. Endereço desconhecido com sessão mostra o
"não encontrado" dentro do painel; sem sessão, fora dele, sem pedir login. A cada troca de tela, o
foco vai para o conteúdo (`main#conteudo`).

## Cadastro e formulários de conta

`/cadastro`, `/confirmar-email/:token` e `/reenviar-confirmacao` são públicas (`src/app/features/auth/`).
A rota da confirmação é a do link que a API manda por e-mail. As regras de nome, e-mail e senha
(`shared/forms/account-rules.ts`) são as da API, com as mesmas mensagens; o e-mail usa o padrão do
`z.email()` do Zod 4, o mesmo do bios-core-api. O `bios-password-field` traz o botão de mostrar a senha e,
na senha nova, a política visível antes do primeiro erro.

Senha: `/esqueci-senha` pede o link (mesma mensagem exista ou não a conta) e `/redefinir-senha/:token`,
a rota do link do e-mail da API, define a nova; uma senha fora da política não gasta o link. Em
`/conta/senha`, quem está logado troca a senha informando a atual; os erros da API sem `details`
(senha atual errada, nova igual à atual) marcam o campo certo (`setApiError`). Trocar ou redefinir
encerra todas as sessões, inclusive a deste navegador: o app apaga a sessão local e o login diz por quê
(`?senha=alterada` ou `?senha=redefinida`).

Depois do envio, cadastro e reenvio mostram só a mensagem da API, igual para e-mail novo e já cadastrado
(RF01 b). Na versão de apresentação, o `bios-mail-preview` faz as vezes da caixa de entrada: mostra como
hiperlink o link que o e-mail traria, ou diz que nada chegou.

`/entrar` abre a sessão e leva ao destino guardado em `?voltar=`, se for um caminho do próprio app
(`safeReturnUrl`), ou ao `/painel`. As mensagens são as da API, sem apontar qual campo errou. Conta não
confirmada oferece o reenvio do link; bloqueio por tentativas mostra o tempo restante e trava o botão
até lá. A senha de quem entra só precisa existir (`currentPasswordRules`), sem a política da senha nova.

O menu da conta tem "Sair" e "Sair de todos os dispositivos"; o segundo pede confirmação
(`confirmAction`, em `shared/dialogs/`, com o foco inicial em "Cancelar"). A sessão local é apagada
mesmo se a chamada falhar, e o app vai para o login.

## Conta

`/conta` (`src/app/features/account/`) mostra os dados de quem entrou (nome, e-mail, papel e endereço) e
edita o nome e o endereço. A conta vem de `OwnAccount` (`core/account/`), a mesma que o menu da barra
lê: ao salvar, a resposta da API passa a valer nos dois lugares, sem outra leitura.

- **Só o que mudou:** "Salvar" só habilita quando algo mudou (`accountChanges`), e a edição envia só o
  que mudou; o endereço vai inteiro, com o CEP em dígitos.
- **Endereço opcional:** sem endereço gravado, os campos em branco não são cobrados; começar a
  preenchê-los cobra os demais, com as regras e as mensagens da API (`shared/forms/address-rules.ts`).
  O CEP tem máscara (`00000-000`) e a UF vem das 27 siglas.
- **Remover endereço:** pede confirmação e envia `address: null`.
- **Excluir conta:** o diálogo lista o que será apagado e pede a senha; "Excluir conta" só habilita com
  ela preenchida, e senha errada mantém o diálogo aberto, com o erro no campo. Excluída, a sessão local
  some (a API já a encerrou) e o app volta à página inicial com o aviso (`/?conta=excluida`).
- **Trocar e-mail:** pede o novo endereço e a senha atual; o link vai para o novo endereço, e até ele
  ser aberto o e-mail da conta continua o atual. A resposta é a mesma para um endereço livre e para um
  de outra conta. O link abre `/confirmar-novo-email/:token` (pública: pode ser aberta em outro
  aparelho), que efetiva a troca e, com sessão, recarrega a conta.

## Estados de tela e erros

Toda tela que carrega dados usa os mesmos estados (`src/app/shared/`, NFIN03):

- `bios-async-state` junta carregando (`bios-loading`, anunciado ao leitor de tela), erro
  (`bios-error-state`) e vazio (`bios-empty-state`, com a explicação própria da lista), e marca a região
  com `aria-busy` enquanto espera.
- `describeError` decide como mostrar uma falha: a mensagem é sempre a da API (falha que não veio da API
  vira uma mensagem genérica em português); `429` mostra quando será possível repetir e bloqueia "Tentar
  de novo" até lá; `503` é indisponibilidade temporária, com o botão.
- Formulários: `applyApiErrors` marca cada campo pelo `details[].path` de um 422 (`apiErrorOf` lê a
  mensagem no `mat-error`), e `bios-form-error-summary` mostra no topo o que não é de um campo.

## Perfil da empresa

A consulta por CNPJ (`bios-cnpj-search`, em `src/app/features/profile/`) fica no topo do painel, em
`/empresas` e, em tela larga, na barra do topo. O CNPJ é conferido antes de qualquer chamada, com o
algoritmo do value object da API (`shared/cnpj/cnpj.ts`: numérico e alfanumérico, dígitos
verificadores, recusa de sequência de um caractere só), e o perfil abre em `/empresas/<cnpj>` com o
CNPJ normalizado, sem a máscara na URL.

O mesmo campo aceita razão social ou nome fantasia. Texto com até 100 caracteres e ao menos uma
palavra de três caracteres abre `/empresas?nome=...`, que usa `searchCompanies` sobre a base local,
com 20 resultados por página. Nome e página ficam na URL para preservar a busca ao voltar do perfil.
Texto curto ou longo é recusado antes da chamada. Sem resultados, a tela explica que só aparecem
empresas já consultadas pelo CNPJ e oferece o próprio campo para essa consulta.

O perfil mostra a razão social, o nome fantasia e a seção "Dados cadastrais": situação em português
(a não reconhecida com o texto do provedor), porte, endereço, CNAEs com o código formatado e a
descrição, e a data em que a fonte atualizou o cadastro. "Empresa não encontrada" (`404`) e
indisponibilidade temporária (`503`, com "Tentar de novo") são telas diferentes.

A seção "Evidências"
usa o mesmo `getCompanyProfile` e separa infrações ambientais, conduta administrativa e inventários
de GEE. Cada registro mostra fonte, estado e datas de publicação, coleta e validade. Só URL HTTPS
absoluta e sem credenciais vira link externo; sem ela, a referência aparece como texto. Um achado
sem link válido nem referência é mostrado como não verificado, sem seu resumo confirmatório.
`UNKNOWN` e `NOT_FOUND` têm explicações diferentes; a proveniência informa coleta, persistência,
atualização pendente ou fonte indisponível e, quando houver, o prazo sugerido para recarregar. O
período das sanções é apresentado como dado histórico da fonte, sem afirmar vigência.

A seção "Índices por ODS" mostra cada ODS ativo em um cartão próprio, com índice e confiança lado a lado,
sem índice geral nem comparação entre ODS. A escala neutra marca o zero e só aparece quando há
índice calculado; índice pendente e ausência de evidência conclusiva têm textos distintos. A
cobertura das fontes e o prazo sugerido para recálculo aparecem em texto.

Cada cartão oferece
"Como o índice foi calculado": as contribuições mostram fonte, categoria, referência, peso,
sinal e pontos, com a soma final. Peso reduzido e evidência vencida recebem avisos próprios. Um
botão leva à evidência no mesmo perfil e o endereço original é oferecido quando for HTTPS válido.
Os centésimos do índice são preservados para a soma exibida reproduzir o valor do cartão.

## Chaves de API

`/conta/chaves` (`src/app/features/api-keys/`) gera, lista e revoga as chaves de API da conta. O nome
segue a regra da API (2 a 60 caracteres, sem contar os espaços das pontas). A chave completa só existe
na resposta da geração e aparece uma única vez, num diálogo com "Copiar a chave" (que anuncia "Chave
copiada" e, se a cópia falhar, deixa a chave selecionada para o Ctrl+C); o diálogo só fecha pelo botão,
e nada no app guarda o valor depois disso. A lista mostra só nome, prefixo, criação e último uso
("Nunca usada" sem uso), com a contagem diante do teto de 10 chaves ativas. Revogar pede confirmação
(`confirmAction`); uma chave que já não existe (`404`) atualiza a lista. A página também explica o uso
na API pública: cabeçalho `x-api-key` em `GET /v1/companies/{cnpj}`, com a documentação OpenAPI em
`/docs`, no endereço da API.

## Dados da versão de apresentação

As respostas vêm de uma API local com empresas reais, capturadas por `scripts/capture-api.mjs`, e não
de dados inventados: a demonstração mostra o comportamento verdadeiro da API, inclusive os erros.

A versão publicada lê `public/presentation/v1`, com respostas da API real para 110.372 empresas,
580.166 evidências e 86 setores, geradas por `scripts/build-presentation-data.mjs`. O cadastro veio
do dump oficial da Receita e as sanções, dos arquivos oficiais da CGU, processados pela API real.
Os testes e2e continuam usando as capturas de fixtures. A evolução setorial traz 24 meses:
o último é o agregado real da API, e os anteriores vêm de `scripts/reconstruct-sector-history.mjs`,
que reaplica as regras da própria API ao que existia no fim de cada mês. Antes de gravar, ele reproduz
o índice atual de todas as empresas, e a geração falha se não bater. A tela avisa que a série é
reconstruída. A lista da tela principal
(`movements.json.gz`) traz as 5.000 empresas de movimentação mais recente, reconstruídas pela regra
da API (UC15, regra 8), com a data do fato registrado, e o gerador roda com
`node --experimental-strip-types`, porque reaproveita essa regra do código do app.

- **Uma captura por arquivo:** `src/app/core/mocks/fixtures/<operationId>/<cenário>.ts`, com
  `satisfies CapturedResponse<...>` sobre o tipo gerado da operação e do status. Se a API mudar a forma
  de uma resposta, o `typecheck` recusa a captura antiga. A planilha XLSX fica ao lado, como arquivo.
- **Manifesto** (`fixtures/manifest.json`): commit do bios-core-api, data de cada fase, conta de
  demonstração e as empresas, com o motivo de cada uma.
- **Nada secreto nem pessoal:** senhas, tokens e o segredo das chaves de API viram marcadores antes de
  gravar; a conta de demonstração usa o domínio reservado `example.com`. O `fixtures.spec.ts` recusa
  CPF, e-mail de outro domínio, JWT e segredo de chave (INL02).

Para capturar de novo: API local (`develop` do bios-core-api) com banco limpo, carga inicial, ingestão
do IBAMA e sincronização do GHG, e os e-mails da API indo para um Mailpit (`SMTP_HOST=localhost`,
`SMTP_PORT=1025` no ambiente de quem sobe a API), de onde o roteiro lê os links. Depois:

```bash
BIOS_CAPTURE_PASSWORD=<senha> BIOS_CORE_DIR=<pasta do bios-core-api> \
  node scripts/capture-api.mjs contas admin empresas setores limites
```

As fases e os cenários estão no cabeçalho do script. A fase `limites` bloqueia o login do IP por 15
minutos (RF20) e por isso é a última; a `setores` se repete em outro mês para a série da evolução
setorial ter duas janelas reais.

## Pesquisa de empresas

`/pesquisa` (`src/app/features/search/`) filtra por nome, UF, município, CNAE e, num ODS escolhido entre
os que o BIOS calcula (`listOds`), por índice e confiança mínimos. Os critérios moram na URL
(`/pesquisa?cnae=24&ods=13&indice_min=0&pagina=2&por_pagina=50`): o link é compartilhável e o "voltar"
do navegador refaz a pesquisa anterior. `search-criteria.ts` converte URL, formulário e consulta da API;
mínimos e ordenação (`ordem=asc` ou `ordem=desc`) só existem com o ODS, e a consulta nunca os leva
sem ele. As regras dos campos (`search-rules.ts`) são as da API.

Com um ODS, cada empresa traz índice e confiança em colunas separadas; sem cálculo, aparece "Sem índice",
nunca zero. A lista é tabela em tela larga e cartões abaixo de 720 px; a tabela rola dentro do próprio
contêiner. ODS fora dos calculados mostra os disponíveis, com botão para pesquisar em cada um.
Ao ordenar pelo índice, empresas sem cálculo ficam ao fim nos dois sentidos e são separadas visualmente;
empates usam confiança maior e depois CNPJ. O cabeçalho da tabela anuncia a direção da ordenação.

Com resultados, **Exportar XLSX** baixa a lista inteira com os filtros e a ordem da URL, sem paginação.
O arquivo e seu nome vêm da resposta capturada da API; a planilha não é gerada no navegador. Uma
pesquisa sem planilha capturada informa a limitação da versão de apresentação. Erros de lista vazia,
teto excedido e limite de requisições aparecem junto aos resultados.

## Setores

`/setores` mostra a evolução do índice médio de um setor (divisão CNAE) num ODS, mês a mês
(`src/app/features/sectors/`). Setor e ODS ficam na URL (`/setores?cnae=24&ods=13`); o campo aceita
divisão, grupo, classe ou subclasse, com ou sem máscara, e sugere os setores de `listSectors`. Tudo é
agregado: nenhuma empresa aparece na tela.

O gráfico de linha (ECharts, só os módulos usados, carregado sob demanda) põe índice médio e confiança
média em eixos separados, nunca combinados; a tabela ao lado traz os mesmos números para o leitor de
tela. Média omitida por amostra mínima é lacuna explicada, nunca zero, e as contagens continuam visíveis.
Com menos de dois meses registrados, a tela diz que o histórico ainda é insuficiente e mostra o que já
há. Na versão de apresentação, só aparecem as janelas capturadas da API: nenhum mês é gerado no front.

## Administração

`/admin/dominios-bloqueados` é a blacklist de domínios de e-mail (`src/app/features/admin/`), só para o
papel `ADMIN`: o `USER` não vê o item no menu e, pela URL, vai para `/acesso-negado`. A lista vem em
ordem alfabética, paginada, com a origem ("Carga inicial" ou "Administrador") e a data de inclusão.
Incluir valida o domínio com a regra da API (`shared/forms/domain-rules.ts`: só o domínio, sem `@`) e o
grava em minúsculas; domínio já bloqueado marca o campo com o aviso da API. Remover pede confirmação.
O efeito é imediato: o domínio passa (ou deixa) de barrar cadastros e trocas de e-mail na hora.

## Tema

As cores vêm da apresentação do projeto (`bios-docs/assets/BIOS - PPTX.pptx`). As paletas do Material 3
(`src/styles/_theme-colors.scss`) foram geradas com `ng generate @angular/material:theme-color`, e as
cores exatas ficam como variáveis CSS para a marca e os gráficos:

| Variável             | Cor       | Uso                               |
| -------------------- | --------- | --------------------------------- |
| `--bios-brand-green` | `#2C5F2D` | Primária: barra superior, títulos |
| `--bios-brand-leaf`  | `#97BC62` | Terciária: destaques              |
| `--bios-brand-moss`  | `#5B6B5B` | Texto de apoio                    |
| `--bios-brand-ink`   | `#1A1A1A` | Texto                             |
| `--bios-brand-paper` | `#F5F5F5` | Superfícies, rodapé               |

## Publicação (Vercel)

A versão de apresentação é estática e é publicada na Vercel (plano Hobby) a cada merge na `main`.
`vercel.json` define a instalação (o mesmo npm 11 do CI), o build (`npm run build`), a pasta publicada
(`dist/bios-webapp/browser`) e a reescrita de toda rota para `index.html`, para um link profundo
(`/empresas/<cnpj>`) abrir direto. O rodapé avisa que os dados são capturados, e um e2e confere que o site
não faz nenhuma requisição fora da própria origem: não há API real nem segredo no build.

Para criar o projeto (uma vez):

1. Em vercel.com, **Add New → Project → Import** o repositório `odavibatista/bios-webapp`.
2. **Framework Preset:** Other (o `vercel.json` já traz instalação, build e saída). Nenhuma variável de
   ambiente.
3. Depois de criado: **Settings → Git → Production Branch:** `main`; **Settings → Build and Deployment →
   Node.js Version:** 22.x, o mesmo do Volta.
4. Conferir no endereço público: a página inicial abre, e uma rota inexistente (`/rota-que-nao-existe`)
   mostra a página "não encontrado" do app, e não o 404 da Vercel.

## Fluxo de contribuição

Branch a partir do `develop`, PR de volta para ele com título em Conventional Commits, e promoção
`develop` → `pre-prod` → `main` por PR, com os checks **Lint** e **Testes** do CI. A proteção dos
branches (NFSE11) está versionada em [`.github/rulesets/`](.github/rulesets/README.md), com o passo
para aplicá-la no GitHub.

---

Projeto acadêmico de Engenharia de Software e Gestão e Qualidade de Software (Ciência da Computação, USJT).
