import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterOutlet } from '@angular/router';
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
}
