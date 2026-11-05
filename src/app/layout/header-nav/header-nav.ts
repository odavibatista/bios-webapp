import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { SessionStore } from '../../core/session/session-store';
import { navItemsFor } from '../panel-nav';

/** Navegação disponível no cabeçalho, segundo o papel da conta. */
@Component({
  selector: 'bios-header-nav',
  imports: [MatButtonModule, MatIconModule, MatMenuModule, RouterLink],
  template: `
    <button
      mat-icon-button
      type="button"
      aria-label="Áreas do painel"
      [matMenuTriggerFor]="panelNav"
    >
      <mat-icon fontSet="material-symbols-outlined" aria-hidden="true">menu</mat-icon>
    </button>
    <mat-menu #panelNav="matMenu">
      @for (item of navItems(); track item.path) {
        <a mat-menu-item [routerLink]="item.path">
          <mat-icon fontSet="material-symbols-outlined" aria-hidden="true">{{
            item.icon
          }}</mat-icon>
          {{ item.label }}
        </a>
      }
    </mat-menu>
  `,
  styles: `
    :host {
      display: block;
      color: inherit;
    }

    button {
      color: inherit;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderNav {
  private readonly store = inject(SessionStore);
  protected readonly navItems = computed(() => navItemsFor(this.store.user()?.role));
}
