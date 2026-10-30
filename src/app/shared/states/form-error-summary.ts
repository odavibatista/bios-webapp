import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Erros do formulário que não pertencem a um campo (#16): ficam no topo e são anunciados ao leitor
 * de tela. Os de campo vão no `mat-error` de cada um (`applyApiErrors`, `apiErrorOf`).
 */
@Component({
  selector: 'bios-form-error-summary',
  template: `
    @if (messages().length) {
      <div class="summary" role="alert">
        @for (message of messages(); track $index) {
          <p>{{ message }}</p>
        }
      </div>
    }
  `,
  styles: `
    .summary {
      margin-bottom: 1rem;
      padding: 0.75rem 1rem;
      border-left: 4px solid var(--mat-sys-error);
      background: var(--mat-sys-error-container);
      color: var(--mat-sys-on-error-container);
    }

    p {
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormErrorSummary {
  readonly messages = input<readonly string[]>([]);
}
