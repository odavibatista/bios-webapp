import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, type MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';

/** A chave recém-gerada: só existe neste diálogo (NFSE01). */
export interface CreatedKeyDialogData {
  name: string;
  key: string;
}

/**
 * A chave completa, mostrada uma única vez logo depois de gerar (UC11, passo 3; NFSE01; #27).
 * O valor vive só nos dados do diálogo: fechá-lo o descarta, e nenhuma outra tela o recebe. O
 * diálogo só fecha pelo botão (nem Esc nem clique fora), para a chave não se perder sem querer.
 */
@Component({
  selector: 'bios-created-key-dialog',
  imports: [MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Chave gerada</h2>
    <mat-dialog-content>
      <p class="warning">
        <mat-icon fontSet="material-symbols-outlined" aria-hidden="true">warning</mat-icon>
        <span>
          <strong>Copie a chave agora: ela não será mostrada de novo.</strong>
          Se você a perder, gere outra e revogue esta.
        </span>
      </p>
      <p class="label" id="rotulo-chave-gerada">Chave “{{ data.name }}”</p>
      <code #keyText class="key" aria-labelledby="rotulo-chave-gerada">{{ data.key }}</code>
      <div class="copy">
        <button mat-stroked-button type="button" (click)="copy()">
          <mat-icon fontSet="material-symbols-outlined" aria-hidden="true">
            {{ copied() ? 'check' : 'content_copy' }}
          </mat-icon>
          {{ copied() ? 'Chave copiada' : 'Copiar a chave' }}
        </button>
      </div>
      @if (copyFailed()) {
        <p class="copy-failed">
          Não foi possível copiar automaticamente. A chave ficou selecionada: copie com Ctrl+C (⌘+C
          no Mac).
        </p>
      }
      <p class="visually-hidden" role="status">{{ announcement() }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button type="button" mat-dialog-close>Já guardei a chave</button>
    </mat-dialog-actions>
  `,
  styles: `
    .warning {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-left: 4px solid var(--mat-sys-tertiary);
      background: var(--mat-sys-surface-container);
    }

    .label {
      margin: 1rem 0 0.25rem;
      font-weight: 600;
    }

    .key {
      display: block;
      padding: 0.75rem;
      border-radius: var(--mat-sys-corner-small);
      background: var(--mat-sys-surface-container-high);
      font-size: 0.95rem;
      overflow-wrap: anywhere;
      user-select: all;
    }

    .copy {
      margin-top: 0.75rem;
    }

    .copy-failed {
      margin: 0.75rem 0 0;
      color: var(--mat-sys-error);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatedKeyDialog {
  protected readonly data = inject<CreatedKeyDialogData>(MAT_DIALOG_DATA);

  protected readonly copied = signal(false);
  protected readonly copyFailed = signal(false);
  /** O que o leitor de tela ouve depois de copiar: "Chave copiada" ou a falha. */
  protected readonly announcement = signal('');

  private readonly keyText = viewChild.required<ElementRef<HTMLElement>>('keyText');

  protected async copy(): Promise<void> {
    try {
      if (!navigator.clipboard) throw new Error('Área de transferência indisponível.');
      await navigator.clipboard.writeText(this.data.key);

      this.copyFailed.set(false);
      this.copied.set(true);
      this.announcement.set('Chave copiada');
    } catch {
      // Sem permissão ou fora de contexto seguro: a chave fica selecionada para o Ctrl+C.
      this.copied.set(false);
      this.copyFailed.set(true);
      this.announcement.set('Não foi possível copiar. A chave ficou selecionada.');
      this.selectKey();
    }
  }

  private selectKey(): void {
    const range = document.createRange();
    const selection = window.getSelection();

    range.selectNodeContents(this.keyText().nativeElement);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
}

/** Mostra a chave recém-gerada e espera a pessoa fechar o diálogo. */
export async function showCreatedKey(dialog: MatDialog, data: CreatedKeyDialogData): Promise<void> {
  const ref = dialog.open<CreatedKeyDialog, CreatedKeyDialogData>(CreatedKeyDialog, {
    data,
    disableClose: true,
    maxWidth: 'min(36rem, calc(100vw - 2rem))',
  });

  await firstValueFrom(ref.afterClosed());
}
