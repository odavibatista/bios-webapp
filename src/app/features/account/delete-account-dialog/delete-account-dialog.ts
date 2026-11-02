import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { BiosApi } from '../../../core/api/bios-api';
import { describeError } from '../../../shared/errors/describe-error';
import { setApiError } from '../../../shared/errors/form-errors';
import { currentPasswordRules } from '../../../shared/forms/account-rules';
import { PasswordField } from '../../../shared/forms/password-field';

/** O que a exclusão apaga, sem remoção lógica (UC05, regra 6). */
export const DELETED_ON_ACCOUNT_REMOVAL: readonly string[] = [
  'seus dados pessoais: nome, e-mail e endereço;',
  'as sessões abertas em todos os dispositivos;',
  'os links de confirmação e de redefinição ainda não usados;',
  'as chaves de API, que param de funcionar na hora;',
  'os bloqueios de acesso e os registros dos e-mails enviados a você.',
];

/**
 * Confirmação da exclusão da conta (UC05, fluxos 1.2 e 1.3; RF27; #30). Explica o que some, pede
 * a senha e só habilita "Excluir conta" com ela preenchida. Senha errada mantém o diálogo aberto,
 * com o erro no campo. Fecha com `true` quando a API excluiu a conta.
 */
@Component({
  selector: 'bios-delete-account-dialog',
  imports: [MatButtonModule, MatDialogModule, PasswordField, ReactiveFormsModule],
  template: `
    <h2 mat-dialog-title>Excluir a sua conta?</h2>
    <form [formGroup]="form" (ngSubmit)="confirm()" novalidate>
      <mat-dialog-content>
        <p>A exclusão é definitiva e não pode ser desfeita. Serão apagados:</p>
        <ul>
          @for (item of deleted; track item) {
            <li>{{ item }}</li>
          }
        </ul>
        <p>Para confirmar, informe a sua senha.</p>
        <bios-password-field [control]="form.controls.password" autocomplete="current-password" />
        @if (failure(); as message) {
          <p class="failure" role="alert">{{ message }}</p>
        }
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close cdkFocusInitial [disabled]="deleting()">
          Cancelar
        </button>
        <!-- Durante a exclusão, aria-disabled: desabilitar o botão com foco jogaria o foco no body. -->
        <button
          mat-flat-button
          type="submit"
          class="danger"
          [disabled]="!hasPassword()"
          [attr.aria-disabled]="deleting() || null"
        >
          {{ deleting() ? 'Excluindo…' : 'Excluir conta' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    ul {
      margin: 0 0 1rem;
      padding-left: 1.25rem;
    }

    .failure {
      margin: 0.5rem 0 0;
      color: var(--mat-sys-error);
    }

    .danger {
      --mat-button-filled-container-color: var(--mat-sys-error);
      --mat-button-filled-label-text-color: var(--mat-sys-on-error);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteAccountDialog {
  private readonly api = inject(BiosApi);
  private readonly ref = inject<MatDialogRef<DeleteAccountDialog, boolean>>(MatDialogRef);

  protected readonly deleted = DELETED_ON_ACCOUNT_REMOVAL;
  protected readonly form = new FormGroup({
    password: new FormControl('', { nonNullable: true, validators: [currentPasswordRules] }),
  });
  private readonly password = this.form.controls.password;

  protected readonly deleting = signal(false);
  protected readonly failure = signal<string | null>(null);

  private readonly typed = toSignal(this.password.valueChanges, { initialValue: '' });
  /** "Excluir conta" só habilita com a senha preenchida (fluxo 1.2). */
  protected readonly hasPassword = computed(() => this.typed().length > 0);

  protected async confirm(): Promise<void> {
    if (this.deleting() || !this.hasPassword() || this.password.invalid) return;

    this.deleting.set(true);
    this.failure.set(null);
    this.ref.disableClose = true;

    try {
      await this.api.deleteOwnAccount({ body: { password: this.password.value } });
      this.ref.close(true);
    } catch (error) {
      const view = describeError(error);

      // Senha errada: o diálogo continua aberto, com o erro no campo (critério de aceite).
      if (view.code === 'INVALID_CURRENT_PASSWORD') setApiError(this.password, view.message);
      else this.failure.set(view.message);
    } finally {
      this.deleting.set(false);
      this.ref.disableClose = false;
    }
  }
}

/** Abre a confirmação e diz se a conta foi excluída. */
export async function confirmAccountDeletion(dialog: MatDialog): Promise<boolean> {
  const ref = dialog.open<DeleteAccountDialog, void, boolean>(DeleteAccountDialog, {
    role: 'alertdialog',
    maxWidth: 'min(32rem, calc(100vw - 2rem))',
  });

  return (await firstValueFrom(ref.afterClosed())) === true;
}
