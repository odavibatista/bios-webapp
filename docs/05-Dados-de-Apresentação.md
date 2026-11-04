# 05. Dados da versão de apresentação

🇧🇷 **Português** · 🇺🇸 [English](en/05-Presentation-Data.md)

[Índice da documentação](README.md) · ← [04. Empresas e índices](04-Empresas-e-Índices.md) · [06. Qualidade e testes](06-Qualidade-e-Testes.md) →

> Como as respostas reais da API são capturadas, guardadas e conferidas.

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
