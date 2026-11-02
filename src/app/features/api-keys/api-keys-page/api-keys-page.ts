import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  resource,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BiosApi } from '../../../core/api/bios-api';
import type { ApiKeyResponse } from '../../../core/api/generated';
import { confirmAction } from '../../../shared/dialogs/confirm-dialog';
import { describeError } from '../../../shared/errors/describe-error';
import { applyApiErrors } from '../../../shared/errors/form-errors';
import { fieldMessage } from '../../../shared/forms/account-rules';
import { AsyncState } from '../../../shared/states/async-state';
import { FormErrorSummary } from '../../../shared/states/form-error-summary';
import { apiKeyNameRules, MAX_ACTIVE_API_KEYS } from '../api-key-rules';
import { showCreatedKey } from '../created-key-dialog/created-key-dialog';

/** Data e hora no horário de Brasília (`30/10/2026, 10:14`), o mesmo em qualquer fuso. */
export function formatKeyDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(iso));
}

/**
 * Chaves de API da conta (UC11, RF16, RF17; #27): gerar com um nome, ver a chave completa uma
 * única vez (no diálogo, NFSE01), listar as ativas só com nome, prefixo, criação e último uso
 * (regra 2) e revogar, depois de confirmar (fluxo 2.1). A página também explica como usar a chave
 * na API pública.
 */
@Component({
  selector: 'bios-api-keys-page',
  imports: [
    AsyncState,
    FormErrorSummary,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './api-keys-page.html',
  styleUrl: './api-keys-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiKeysPage {
  private readonly api = inject(BiosApi);
  private readonly dialog = inject(MatDialog);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly maxKeys = MAX_ACTIVE_API_KEYS;
  protected readonly formatDate = formatKeyDate;
  protected readonly messageOf = fieldMessage;

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [apiKeyNameRules] }),
  });

  protected readonly keys = resource({ loader: () => this.api.listApiKeys() });
  protected readonly activeKeys = computed(() =>
    this.keys.hasValue() ? this.keys.value().data : [],
  );

  protected readonly creating = signal(false);
  protected readonly formErrors = signal<string[]>([]);
  /** A chave sendo revogada, para travar o botão dela. */
  protected readonly revoking = signal<string | null>(null);
  /** Resultado da última ação, anunciado ao leitor de tela. */
  protected readonly notice = signal<string | null>(null);
  protected readonly revokeError = signal<string | null>(null);

  private readonly listHeading = viewChild<ElementRef<HTMLElement>>('listHeading');

  protected async create(): Promise<void> {
    if (this.creating()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusInvalidName();
      return;
    }

    this.creating.set(true);
    this.formErrors.set([]);
    this.notice.set(null);
    this.revokeError.set(null);

    let created: { name: string; key: string };

    try {
      const response = await this.api.createApiKey({
        body: { name: this.form.getRawValue().name.trim() },
      });

      created = { name: response.name, key: response.key };
    } catch (error) {
      this.formErrors.set(applyApiErrors(this.form, describeError(error)));
      this.focusInvalidName();
      return;
    } finally {
      this.creating.set(false);
    }

    this.form.reset();
    this.keys.reload();
    // A chave completa só passa pelo diálogo; fechado, nada aqui a guarda.
    await showCreatedKey(this.dialog, created);
    this.notice.set(`Chave “${created.name}” gerada.`);
  }

  protected async revoke(key: ApiKeyResponse): Promise<void> {
    if (this.revoking()) return;

    const confirmed = await confirmAction(this.dialog, {
      title: `Revogar a chave “${key.name}”?`,
      message:
        'Os sistemas que usam esta chave perdem o acesso na hora. A revogação não pode ser ' +
        'desfeita: para voltar a integrar, será preciso gerar outra chave.',
      confirmLabel: 'Revogar',
    });

    if (!confirmed) return;

    this.revoking.set(key.id);
    this.notice.set(null);
    this.revokeError.set(null);

    try {
      await this.api.revokeApiKey({ path: { id: key.id } });
      this.notice.set(`Chave “${key.name}” revogada.`);
    } catch (error) {
      const view = describeError(error);

      // Já revogada ou inexistente (regra 6): a lista estava velha e é recarregada.
      this.revokeError.set(
        view.code === 'API_KEY_NOT_FOUND'
          ? `${view.message} A lista foi atualizada.`
          : view.message,
      );
    } finally {
      this.revoking.set(null);
      this.keys.reload();
      // A linha some com a chave: o foco vai ao título da lista, e não ao começo da página.
      afterNextRender(() => this.listHeading()?.nativeElement.focus(), {
        injector: this.injector,
      });
    }
  }

  private focusInvalidName(): void {
    afterNextRender(
      () => {
        this.host.nativeElement.querySelector<HTMLElement>('input[aria-invalid="true"]')?.focus();
      },
      { injector: this.injector },
    );
  }
}
