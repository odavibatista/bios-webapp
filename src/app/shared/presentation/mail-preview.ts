import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { type MockEmail, MockMailbox } from '../../core/mocks/mock-mailbox';
import { PRESENTATION_MODE } from '../../core/presentation-mode';

const LINK_LABELS: Record<MockEmail['kind'], string> = {
  'confirmar-email': 'Confirmar o e-mail',
  'redefinir-senha': 'Redefinir a senha',
  'confirmar-novo-email': 'Confirmar o novo e-mail',
};

/**
 * Aviso "Modo apresentação" (decisão de 30/10/2026): sem e-mail de verdade, mostra o link que o
 * e-mail traria, como hiperlink. É a caixa de entrada de quem recebe, por isso diz também quando
 * nada chegou. Só existe na versão de apresentação; com a API real, não aparece.
 */
@Component({
  selector: 'bios-mail-preview',
  imports: [MatIconModule, RouterLink],
  template: `
    @if (presentation) {
      <aside class="preview" aria-labelledby="titulo-modo-demo">
        <mat-icon fontSet="material-symbols-outlined" aria-hidden="true"
          >mark_email_unread</mat-icon
        >
        <div>
          <h2 id="titulo-modo-demo">Modo apresentação</h2>
          <p>Nesta versão, nenhum e-mail é enviado de verdade.</p>
          @if (email(); as email) {
            <p>
              O e-mail para <strong>{{ email.to }}</strong> traria este link:
              <a [routerLink]="email.link">{{ label() }}</a>
            </p>
          } @else {
            <p>
              A caixa de entrada de <strong>{{ normalizedTo() }}</strong> não recebeu e-mail com
              link.
            </p>
          }
        </div>
      </aside>
    }
  `,
  styles: `
    .preview {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      margin-top: 1.5rem;
      padding: 1rem;
      border: 1px dashed var(--mat-sys-outline);
      border-radius: var(--mat-sys-corner-medium);
      background: var(--mat-sys-surface-container);
    }

    h2 {
      margin: 0 0 0.25rem;
      font: var(--mat-sys-title-small);
    }

    p {
      margin: 0 0 0.25rem;
      overflow-wrap: anywhere;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MailPreview {
  /** Para quem o e-mail iria. */
  readonly to = input.required<string>();
  readonly kind = input.required<MockEmail['kind']>();

  protected readonly presentation = inject(PRESENTATION_MODE);
  private readonly mailbox = inject(MockMailbox);

  protected readonly normalizedTo = computed(() => this.to().trim().toLowerCase());
  protected readonly email = computed(() => this.mailbox.latest(this.to(), this.kind()));
  protected readonly label = computed(() => LINK_LABELS[this.kind()]);
}
