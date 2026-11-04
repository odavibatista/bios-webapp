# 03. Accounts and access

🇧🇷 [Português](../03-Contas-e-Acesso.md) · 🇺🇸 **English**

[Documentation index](README.md) · ← [02. Architecture](02-Architecture.md) · [04. Companies and indexes](04-Companies-and-Indexes.md) →

> Sign-up, login, password, account, API keys and administration.

## Sign-up and account forms

`/cadastro`, `/confirmar-email/:token` and `/reenviar-confirmacao` are public (`src/app/features/auth/`).
The confirmation route is the one in the link the API emails. Name, email and password rules
(`shared/forms/account-rules.ts`) are the API's, with the same messages; email uses Zod 4's `z.email()`
pattern, the same as bios-core-api. `bios-password-field` has a show-password button and, for a new
password, the policy visible before the first error.

Password: `/esqueci-senha` requests the link (same message whether or not the account exists) and
`/redefinir-senha/:token`, the route in the API's email link, sets the new one; a password outside the
policy does not spend the link. At `/conta/senha`, a signed-in user changes the password by giving the
current one; API errors without `details` (wrong current password, new equal to current) mark the right
field (`setApiError`). Changing or resetting ends every session, this browser's included: the app clears
the local session and the login page says why (`?senha=alterada` or `?senha=redefinida`).

After submitting, sign-up and resend show only the API's message, the same for a new and an already
registered email (RF01 b). In the presentation build, `bios-mail-preview` stands in for the inbox: it
shows the link the email would carry as a hyperlink, or says nothing arrived.

`/entrar` opens the session and goes to the destination stored in `?voltar=`, if it is a path of the app
itself (`safeReturnUrl`), or to `/painel`. Messages are the API's, without pointing at which field was
wrong. An unconfirmed account gets the option to resend the link; a lockout after failed attempts shows
the remaining time and disables the button until then. The sign-in password only has to be present
(`currentPasswordRules`), without the new-password policy.

The account menu has "Sair" (sign out) and "Sair de todos os dispositivos" (sign out everywhere); the
second asks for confirmation (`confirmAction`, in `shared/dialogs/`, with initial focus on "Cancelar").
The local session is cleared even if the call fails, and the app goes to the login page.

## Account

`/conta` (`src/app/features/account/`) shows the signed-in person's data (name, email, role and address)
and edits the name and the address. The account comes from `OwnAccount` (`core/account/`), the same one
the top bar menu reads: on save, the API's response applies in both places, without another read.

- **Only what changed:** "Salvar" is enabled only when something changed (`accountChanges`), and the
  edit sends only what changed; the address goes whole, with the postal code as digits.
- **Optional address:** without a saved address, blank fields are not required; starting to fill them in
  requires the others, with the API's rules and messages (`shared/forms/address-rules.ts`). The postal
  code has a mask (`00000-000`) and the state comes from the 27 abbreviations.
- **Remove address:** asks for confirmation and sends `address: null`.
- **Delete account:** the dialog lists what will be erased and asks for the password; "Excluir conta" is
  enabled only once it is filled in, and a wrong password keeps the dialog open, with the error on the
  field. Once deleted, the local session is cleared (the API already ended it) and the app goes back to
  the home page with a notice (`/?conta=excluida`).
- **Change email:** asks for the new address and the current password; the link goes to the new
  address, and until it is opened the account's email stays the current one. The response is the same
  for a free address and for one that belongs to another account. The link opens
  `/confirmar-novo-email/:token` (public: it may be opened on another device), which applies the change
  and, with a session, reloads the account.

## API keys

`/conta/chaves` (`src/app/features/api-keys/`) creates, lists and revokes the account's API keys. The
name follows the API rule (2 to 60 characters, not counting surrounding spaces). The full key only
exists in the creation response and is shown once, in a dialog with "Copiar a chave" (copy key), which
announces "Chave copiada" and, if copying fails, leaves the key selected for Ctrl+C; the dialog only
closes through its button, and nothing in the app keeps the value afterwards. The list shows only name,
prefix, creation date and last use ("Nunca usada" when never used), with the count against the limit of
10 active keys. Revoking asks for confirmation (`confirmAction`); a key that no longer exists (`404`)
refreshes the list. The page also explains how to use the key in the public API: the `x-api-key`
header on `GET /v1/companies/{cnpj}`, with the OpenAPI documentation at `/docs` on the API's address.

## Administration

`/admin/dominios-bloqueados` is the blacklist of email domains (`src/app/features/admin/`), for the
`ADMIN` role only: a `USER` does not see the menu item and, through the URL, goes to `/acesso-negado`.
The list is alphabetical and paginated, with the origin ("Carga inicial" or "Administrador") and the
date it was added. Adding validates the domain with the API's rule (`shared/forms/domain-rules.ts`: the
domain only, without `@`) and stores it in lowercase; an already blocked domain marks the field with the
API's notice. Removing asks for confirmation. The effect is immediate: the domain starts (or stops)
blocking sign-ups and email changes right away.
