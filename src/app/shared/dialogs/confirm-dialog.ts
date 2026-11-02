import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  type MatDialogConfig,
  MatDialogModule,
} from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

/** O que o diálogo pergunta. */
export interface ConfirmDialogData {
  title: string;
  message: string;
  /** O verbo da ação, no botão que confirma ("Sair de todos", "Excluir conta"). */
  confirmLabel: string;
  cancelLabel?: string;
}

/**
 * Confirmação de uma ação que não dá para desfazer, ou que age fora do que a pessoa vê (#21):
 * sair de todos os dispositivos, excluir a conta, revogar uma chave. O foco começa em "Cancelar",
 * para Enter não confirmar sem querer; Esc e clique fora cancelam.
 */
@Component({
  selector: 'bios-confirm-dialog',
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" [mat-dialog-close]="false" cdkFocusInitial>
        {{ data.cancelLabel ?? 'Cancelar' }}
      </button>
      <button mat-flat-button type="button" [mat-dialog-close]="true">
        {{ data.confirmLabel }}
      </button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {
  protected readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}

/** Abre a confirmação e diz se a pessoa confirmou (`false` ao cancelar, fechar ou sair com Esc). */
export async function confirmAction(
  dialog: MatDialog,
  data: ConfirmDialogData,
  config: MatDialogConfig = {},
): Promise<boolean> {
  const ref = dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
    ...config,
    data,
    role: 'alertdialog',
    maxWidth: 'min(28rem, calc(100vw - 2rem))',
  });

  return (await firstValueFrom(ref.afterClosed())) === true;
}
