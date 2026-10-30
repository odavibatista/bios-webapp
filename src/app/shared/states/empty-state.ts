import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * Lista ou resultado vazio, com a explicação própria de cada tela (#16): nunca uma tabela vazia
 * sem dizer por quê. Ações (ex.: "Buscar pelo CNPJ") entram pelo conteúdo projetado.
 */
@Component({
  selector: 'bios-empty-state',
  imports: [MatIconModule],
  template: `
    <div class="empty">
      <mat-icon fontSet="material-symbols-outlined" aria-hidden="true">{{ icon() }}</mat-icon>
      <div>
        <p>{{ message() }}</p>
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    .empty {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: var(--mat-sys-corner-medium);
      background: var(--bios-brand-paper);
      color: var(--bios-brand-ink);
    }

    p {
      margin: 0 0 0.5rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  readonly message = input.required<string>();
  readonly icon = input('info');
}
