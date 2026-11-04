# 03. Contas e acesso

🇧🇷 **Português** · 🇺🇸 [English](en/03-Accounts-and-Access.md)

[Índice da documentação](README.md) · ← [02. Arquitetura](02-Arquitetura.md) · [04. Empresas e índices](04-Empresas-e-Índices.md) →

> Cadastro, login, senha, conta, chaves de API e administração.

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

## Administração

`/admin/dominios-bloqueados` é a blacklist de domínios de e-mail (`src/app/features/admin/`), só para o
papel `ADMIN`: o `USER` não vê o item no menu e, pela URL, vai para `/acesso-negado`. A lista vem em
ordem alfabética, paginada, com a origem ("Carga inicial" ou "Administrador") e a data de inclusão.
Incluir valida o domínio com a regra da API (`shared/forms/domain-rules.ts`: só o domínio, sem `@`) e o
grava em minúsculas; domínio já bloqueado marca o campo com o aviso da API. Remover pede confirmação.
O efeito é imediato: o domínio passa (ou deixa) de barrar cadastros e trocas de e-mail na hora.
