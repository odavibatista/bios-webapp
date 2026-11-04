# 04. Empresas e índices

🇧🇷 **Português** · 🇺🇸 [English](en/04-Companies-and-Indexes.md)

[Índice da documentação](README.md) · ← [03. Contas e acesso](03-Contas-e-Acesso.md) · [05. Dados da versão de apresentação](05-Dados-de-Apresentação.md) →

> Perfil da empresa, evidências, índices por ODS, pesquisa, exportação e setores.

## Perfil da empresa

### Consulta

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

### Dados cadastrais

O perfil mostra a razão social, o nome fantasia e a seção "Dados cadastrais": situação em português
(a não reconhecida com o texto do provedor), porte, endereço, CNAEs com o código formatado e a
descrição, e a data em que a fonte atualizou o cadastro. "Empresa não encontrada" (`404`) e
indisponibilidade temporária (`503`, com "Tentar de novo") são telas diferentes.

### Evidências

A seção "Evidências" usa o mesmo `getCompanyProfile` e separa infrações ambientais, conduta
administrativa e inventários de GEE.

- **Registro:** cada um mostra fonte, estado e datas de publicação, coleta e validade.
- **Links:** só URL HTTPS absoluta e sem credenciais vira link externo; sem ela, a referência aparece
  como texto. Um achado sem link válido nem referência é mostrado como não verificado, sem seu
  resumo confirmatório.
- **Ausência de dado:** `UNKNOWN` e `NOT_FOUND` têm explicações diferentes; a proveniência informa
  coleta, persistência, atualização pendente ou fonte indisponível e, quando houver, o prazo
  sugerido para recarregar.
- **Sanções:** o período é apresentado como dado histórico da fonte, sem afirmar vigência.

### Índices por ODS

A seção "Índices por ODS" mostra cada ODS ativo em um cartão próprio, com índice e confiança lado a
lado, sem índice geral nem comparação entre ODS.

- **Escala:** neutra, marca o zero e só aparece quando há índice calculado.
- **Sem índice:** índice pendente e ausência de evidência conclusiva têm textos distintos.
- **Cobertura:** a cobertura das fontes e o prazo sugerido para recálculo aparecem em texto.

### Como o índice foi calculado

Cada cartão oferece "Como o índice foi calculado": as contribuições mostram fonte, categoria,
referência, peso, sinal e pontos, com a soma final. Peso reduzido e evidência vencida recebem avisos
próprios. Um botão leva à evidência no mesmo perfil, e o endereço original é oferecido quando for
HTTPS válido. Os centésimos do índice são preservados para a soma exibida reproduzir o valor do
cartão.

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

### Ordem do perfil e situação das fontes

O perfil segue a ordem identificação, índices, evidências e fontes: primeiro o resultado, depois o que o
sustenta. Categoria sem evidência diz, fonte a fonte, se a consulta não achou registro, se está em
andamento ou se não foi possível verificar. A seção "Fontes consultadas" reúne a situação de cada fonte,
com a data da última coleta. No GHG Protocol, cujo registro é voluntário, a falta de inventário aparece
como não localizado no registro, sem confirmar ausência (IND02). Na explicação do índice, uma contribuição
com peso e zero pontos informa que o teto da categoria já foi atingido por outras evidências.
