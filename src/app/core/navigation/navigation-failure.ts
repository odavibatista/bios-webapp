import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { type NavigationError, Router } from '@angular/router';

const RELOADED_AT = 'bios.recarga-por-arquivo';
/** Dentro deste prazo, uma nova falha não recarrega de novo: o arquivo não veio mesmo. */
const RELOAD_GUARD_MS = 60_000;

const CHUNK_FAILURE =
  /dynamically imported module|importing a module script failed|error loading dynamically|chunkloaderror/i;

export function isChunkFailure(error: unknown): boolean {
  return error instanceof Error && CHUNK_FAILURE.test(`${error.name} ${error.message}`);
}

/** Lê e grava fora do alcance de quem bloqueia o armazenamento: sem ele, só não recarrega. */
function reloadedRecently(view: Window, now: number): boolean {
  try {
    const last = Number(view.sessionStorage.getItem(RELOADED_AT) ?? 0);

    if (now - last < RELOAD_GUARD_MS) return true;
    view.sessionStorage.setItem(RELOADED_AT, String(now));

    return false;
  } catch {
    return true;
  }
}

/**
 * Tela carregada sob demanda que não chega (#262). Depois de um deploy, o arquivo antigo some, e
 * recarregar uma vez traz a versão nova; sem conexão, ou se a recarga não resolveu, a pessoa recebe
 * o aviso com "Tentar de novo". Falha de outro tipo segue o caminho normal do roteador.
 */
export function handleNavigationFailure({ url, error }: NavigationError): void {
  if (!isChunkFailure(error)) return;

  const document = inject(DOCUMENT);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  const view = document.defaultView;

  if (view?.navigator.onLine && !reloadedRecently(view, Date.now())) {
    view.location.assign(url);

    return;
  }

  snackBar
    .open('Não foi possível abrir a tela. Confira a conexão.', 'Tentar de novo', { duration: 0 })
    .onAction()
    .subscribe(() => {
      void router.navigateByUrl(url);
    });
}
