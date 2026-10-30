# Rulesets dos branches

Proteção dos branches do fluxo `develop` → `pre-prod` → `main` (RNF NFSE11), versionada como código,
com as mesmas regras do bios-core-api. Os arquivos seguem o formato de exportação de rulesets do
GitHub.

| Arquivo                       | Branches           | Regras                                                                                                                                                                                       |
| ----------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `protecao-develop.json`       | `develop`          | PR obrigatório (**merge commit** ou **squash**), checks **Lint** e **Testes** aprovados com o branch atualizado, conversas resolvidas, sem force push nem exclusão                           |
| `protecao-main-pre-prod.json` | `main`, `pre-prod` | PR obrigatório, apenas **merge commit** (as promoções mantêm o mesmo histórico entre os branches), checks **Lint** e **Testes** aprovados, conversas resolvidas, sem force push nem exclusão |

Os checks são os jobs do workflow `.github/workflows/ci.yml`, com os mesmos nomes dos do
bios-core-api, restritos ao GitHub Actions (`integration_id` 15368). Nenhum PR exige aprovação de
revisor, pois o projeto tem um único integrante; a barreira de qualidade é o CI. Não há atores com
permissão de ignorar as regras.

## Diferenças em relação ao bios-core-api

- **Métodos de merge no `develop`.** O ruleset do core aceita só squash no `develop`; aqui valem
  merge commit e squash, porque os PRs de tarefa do webapp vêm sendo integrados com merge commit.
  As promoções (`pre-prod`, `main`) aceitam só merge commit, como no core.

## Exigência de branch atualizado

`strict_required_status_checks_policy` ("Require branches to be up to date before merging") vale
**só no `develop`**, pelo mesmo motivo do core:

- **No `develop` ela protege de verdade.** Um branch de tarefa fica aberto enquanto o `develop`
  avança, e duas mudanças que passam isoladas podem se contradizer juntas. Exigir o branch
  atualizado força esse encontro antes do merge.
- **Nas promoções ela só atrapalha.** Cada promoção cria um merge commit **no destino**, que nunca
  volta para a origem: o `pre-prod` fica sempre "atrás" da `main`, e o `develop`, atrás do
  `pre-prod`. Com a regra ligada, toda promoção exigiria um merge de volta, invertendo o fluxo de
  mão única.

Desligá-la nas promoções não afrouxa o CI: **Lint** e **Testes** continuam obrigatórios e, como o
workflow roda no evento `pull_request`, o GitHub os executa sobre o merge de origem e destino.

## Como aplicar

Em **Settings → Rules → Rulesets → New ruleset → Import a ruleset**, importe cada arquivo e salve.
Para alterar uma regra, edite o JSON deste diretório e reimporte, mantendo o repositório como fonte
de verdade.

**Conferência (critério da #13):** pelo editor web do GitHub (que não passa pelos hooks locais),
crie uma branch de teste a partir de `develop` com um commit que quebre o lint (ex.: uma variável sem
uso num `.ts`) e abra um PR dela para `pre-prod`. O botão de merge fica bloqueado enquanto o check
**Lint** estiver vermelho. Feche o PR sem mergear e apague a branch de teste.

## Demais configurações do repositório

Não são exportáveis como ruleset e ficam em **Settings**:

| Onde                                     | Configuração                                                                                                                   |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| General → Default branch                 | `main`: os formulários de issue e o fechamento por `Closes #N` valem a partir dela                                             |
| General → Pull Requests                  | Permitir **merge commits** e **squash merging**; desabilitar **rebase merging**; marcar **Automatically delete head branches** |
| Actions → General → Workflow permissions | **Read repository contents and packages permissions**; desmarcar **Allow GitHub Actions to create and approve pull requests**  |
| Code security                            | Habilitar **Dependency graph**, **Dependabot alerts** e **Dependabot security updates**                                        |
