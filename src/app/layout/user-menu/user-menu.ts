import { ChangeDetectionStrategy, Component, computed, inject, resource } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { BiosApi } from '../../core/api/bios-api';
import { SessionStore } from '../../core/session/session-store';
import { roleLabel } from '../panel-nav';

/**
 * Quem entrou, na barra do topo (#18): nome e papel, e o menu da conta. O nome e o e-mail vêm da
 * conta (`getOwnAccount`), para refletir uma edição; enquanto ela carrega, a barra mostra um
 * esqueleto, e não "undefined". O papel vem do token da sessão. "Sair" entra com a #21.
 */
@Component({
  selector: 'bios-user-menu',
  imports: [MatButtonModule, MatIconModule, MatMenuModule, RouterLink],
  template: `
    @if (role(); as role) {
      <button mat-button class="trigger" [matMenuTriggerFor]="menu">
        <mat-icon fontSet="material-symbols-outlined" aria-hidden="true">account_circle</mat-icon>
        @if (name(); as name) {
          <span class="name">{{ name }}</span>
        } @else {
          <span class="skeleton" aria-hidden="true"></span>
          <span class="visually-hidden">Carregando a conta</span>
        }
        <span class="role">{{ role }}</span>
      </button>
      <mat-menu #menu="matMenu" xPosition="before">
        @if (email(); as email) {
          <p class="email">{{ email }}</p>
        }
        <a mat-menu-item routerLink="/conta">
          <mat-icon fontSet="material-symbols-outlined" aria-hidden="true">person</mat-icon>
          Minha conta
        </a>
      </mat-menu>
    }
  `,
  styles: `
    .trigger {
      color: inherit;
    }

    .role {
      margin-left: 0.5rem;
      opacity: 0.85;
      font: var(--mat-sys-body-small);

      @media (max-width: 600px) {
        display: none;
      }
    }

    .skeleton {
      display: inline-block;
      width: 8rem;
      height: 0.9rem;
      border-radius: 4px;
      background: currentColor;
      opacity: 0.3;
      vertical-align: middle;
    }

    .email {
      margin: 0;
      padding: 0.5rem 1rem;
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMenu {
  private readonly api = inject(BiosApi);
  private readonly store = inject(SessionStore);

  /** A conta de quem entrou; recarrega quando muda a pessoa da sessão. */
  private readonly account = resource({
    params: () => this.store.user()?.id,
    loader: () => this.api.getOwnAccount(),
  });

  protected readonly role = computed(() => {
    const user = this.store.user();

    return user ? roleLabel(user.role) : null;
  });

  /** Sem a conta (falha ao carregar), vale o nome da sessão; carregando, o esqueleto. */
  protected readonly name = computed(() => {
    if (this.account.hasValue()) return this.account.value().name;

    return this.account.isLoading() ? null : (this.store.user()?.name ?? null);
  });

  protected readonly email = computed(() =>
    this.account.hasValue() ? this.account.value().email : null,
  );
}
