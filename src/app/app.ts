import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, skip } from 'rxjs';
import { PRESENTATION_MODE } from './core/presentation-mode';
import { SessionStore } from './core/session/session-store';
import { UserMenu } from './layout/user-menu/user-menu';

/** Casca do app: barra superior, área das rotas e rodapé. */
@Component({
  selector: 'bios-root',
  imports: [MatIconModule, MatToolbarModule, RouterLink, RouterOutlet, UserMenu],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  /** Na versão de apresentação, o rodapé avisa de onde vêm os dados (FE-29). */
  protected readonly presentation = inject(PRESENTATION_MODE);

  /** Com sessão, a barra mostra quem entrou (#18). */
  protected readonly signedIn = inject(SessionStore).isAuthenticated;

  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  constructor() {
    // A cada troca de tela, o foco vai para o conteúdo, como numa página nova: o leitor de tela
    // anuncia a tela que chegou, e o Tab segue dali, sem voltar ao topo (NFIN01). A primeira
    // navegação é a carga da página, e o navegador já cuida dela.
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        skip(1),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.main().nativeElement.focus();
      });
  }
}
