import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink } from '@angular/router';
import { OwnAccount } from '../../core/account/own-account';
import { LOGIN_PATH, SessionService } from '../../core/session/session.service';
import { SessionStore } from '../../core/session/session-store';
import { confirmAction } from '../../shared/dialogs/confirm-dialog';
import { roleLabel } from '../panel-nav';

/**
 * Quem entrou, na barra do topo (#18): nome e papel, e o menu da conta. O nome e o e-mail vêm da
 * conta (`OwnAccount`), para refletir uma edição; enquanto ela carrega, a barra mostra um
 * esqueleto, e não "undefined". O papel vem do token da sessão.
 *
 * "Sair" e "Sair de todos os dispositivos" (UC03, RF23; #21) encerram a sessão e levam ao login.
 */
@Component({
  selector: 'bios-user-menu',
  imports: [MatButtonModule, MatDividerModule, MatIconModule, MatMenuModule, RouterLink],
  template: `
    @if (role(); as role) {
      <button mat-button class="trigger" [matMenuTriggerFor]="menu">
        <mat-icon fontSet="material-symbols-outlined" aria-hidden="true">account_circle</mat-icon>
        <span class="identity">
          @if (name(); as name) {
            <span class="name">{{ name }}</span>
          } @else {
            <span class="skeleton" aria-hidden="true"></span>
            <span class="visually-hidden">Carregando a conta</span>
          }
          <span class="role">{{ role }}</span>
        </span>
      </button>
      <mat-menu #menu="matMenu" xPosition="before">
        @if (email(); as email) {
          <p class="email">{{ email }}</p>
        }
        <a mat-menu-item routerLink="/conta">
          <mat-icon fontSet="material-symbols-outlined" aria-hidden="true">person</mat-icon>
          Minha conta
        </a>
        <mat-divider />
        <button mat-menu-item type="button" (click)="signOut()">
          <mat-icon fontSet="material-symbols-outlined" aria-hidden="true">logout</mat-icon>
          Sair
        </button>
        <button mat-menu-item type="button" (click)="signOut(true)">
          <mat-icon fontSet="material-symbols-outlined" aria-hidden="true">devices</mat-icon>
          Sair de todos os dispositivos
        </button>
      </mat-menu>
    }
  `,
  styles: `
    .trigger {
      color: inherit;
      display: inline-flex;
      align-items: center;
    }

    .identity {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 0;
    }

    // Nome longo não empurra a barra para fora da tela (NFIN02): corta com reticências, e o nome
    // inteiro continua no nome acessível do botão.
    .name {
      display: block;
      max-width: 12rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 1.25rem;

      // No celular, só o ícone: o nome segue no nome acessível do botão (#263).
      @media (max-width: 599.98px) {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip-path: inset(50%);
      }
    }

    .role {
      opacity: 0.85;
      font: var(--mat-sys-body-small);
      line-height: 1.25rem;

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
  private readonly store = inject(SessionStore);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  /** A conta de quem entrou, a mesma que `/conta` edita: o nome novo aparece aqui ao salvar. */
  private readonly account = inject(OwnAccount).account;

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

  /**
   * Sai neste dispositivo ou, depois de confirmar, em todos. A sessão local some mesmo se a
   * chamada falhar (`SessionService.signOut`), e o app vai para o login do mesmo jeito: nenhum
   * token continua valendo aqui (UC03, pós-condição).
   */
  protected async signOut(everywhere = false): Promise<void> {
    if (
      everywhere &&
      !(await confirmAction(this.dialog, {
        title: 'Sair de todos os dispositivos?',
        message:
          'As sessões abertas em outros aparelhos e navegadores também serão encerradas, e será ' +
          'preciso entrar de novo em cada um.',
        confirmLabel: 'Sair de todos',
      }))
    ) {
      return;
    }

    try {
      await this.session.signOut(everywhere);
    } catch {
      // A sessão local já foi apagada; a falha da API não muda o que a pessoa vê.
    }
    await this.router.navigateByUrl(LOGIN_PATH);
  }
}
