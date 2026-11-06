import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, Scroll } from '@angular/router';

/** Tempo para a lista chegar e a página crescer até a posição guardada. */
const RESTORE_WINDOW_MS = 3_000;
const USER_TAKES_OVER = ['wheel', 'touchstart', 'keydown', 'mousedown'] as const;

const pathOf = (url: string) => url.split(/[?#]/)[0];

/**
 * Rolagem entre telas (#261). Voltar leva à posição de onde a pessoa saiu, e ir para outra tela abre
 * no topo. Trocar só os parâmetros da mesma tela (filtro, aba, página) não mexe na rolagem.
 *
 * A opção pronta do roteador não serve: ela rola antes de a lista carregar, com a página ainda
 * curta, e sobe ao topo a cada troca de filtro. Aqui, a posição é conferida a cada quadro, enquanto
 * a página cresce, até o fim do prazo ou até a pessoa rolar por conta própria.
 */
@Injectable({ providedIn: 'root' })
export class ScrollMemory {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);

  private path = '';
  private stopRestoring: (() => void) | null = null;

  start(): void {
    const view = this.document.defaultView;

    if (view === null) return;

    view.history.scrollRestoration = 'manual';
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.stopRestoring?.();
      } else if (event instanceof NavigationEnd) {
        this.openNewScreen(view, event.urlAfterRedirects);
      } else if (event instanceof Scroll && event.position) {
        this.restore(view, event.position[1]);
      }
    });
  }

  private openNewScreen(view: Window, url: string): void {
    const path = pathOf(url);

    if (path !== this.path && this.path !== '') view.scrollTo(0, 0);
    this.path = path;
  }

  private restore(view: Window, top: number): void {
    let frame = 0;
    const place = () => {
      if (Math.abs(view.scrollY - top) > 1) view.scrollTo(0, top);
      frame = view.requestAnimationFrame(place);
    };
    const stop = () => {
      view.cancelAnimationFrame(frame);
      view.clearTimeout(deadline);
      USER_TAKES_OVER.forEach((name) => {
        view.removeEventListener(name, stop);
      });
      this.stopRestoring = null;
    };
    const deadline = view.setTimeout(stop, RESTORE_WINDOW_MS);

    this.stopRestoring = stop;
    USER_TAKES_OVER.forEach((name) => {
      view.addEventListener(name, stop, { once: true, passive: true });
    });
    place();
  }
}
