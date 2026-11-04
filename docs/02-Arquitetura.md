# 02. Arquitetura

🇧🇷 **Português** · 🇺🇸 [English](en/02-Architecture.md)

[Índice da documentação](README.md) · ← [01. Como rodar](01-Como-Rodar.md) · [03. Contas e acesso](03-Contas-e-Acesso.md) →

> Camada de dados, sessão, casca do painel e estados de tela.

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

`/demonstracao` entra com a conta de demonstração e leva ao painel: é o destino do QR Code da
apresentação. A senha não vai na URL, e fora da versão de apresentação a rota leva ao login.

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
