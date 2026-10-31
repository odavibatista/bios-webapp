import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { SessionStore } from '../../core/session/session-store';
import { navItemsFor } from '../panel-nav';

/** Abaixo desta largura, o menu vira gaveta (NFIN02). */
export const NARROW_LAYOUT = '(max-width: 959.98px)';

/**
 * Casca do painel autenticado (#18): menu das áreas que o papel permite, fixo ao lado em telas
 * largas e em gaveta nas estreitas, e as páginas do painel ao lado dele.
 */
@Component({
  selector: 'bios-panel-layout',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  templateUrl: './panel-layout.html',
  styleUrl: './panel-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelLayout {
  private readonly store = inject(SessionStore);

  protected readonly items = computed(() => navItemsFor(this.store.user()?.role));
  protected readonly narrow = toSignal(
    inject(BreakpointObserver)
      .observe(NARROW_LAYOUT)
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );
  protected readonly drawerOpen = signal(false);

  protected toggleDrawer(): void {
    this.drawerOpen.update((open) => !open);
  }

  /** Na gaveta, escolher um item fecha o menu e mostra a página. */
  protected closeDrawer(): void {
    this.drawerOpen.set(false);
  }
}
