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
import type { BlockedEmailDomain } from '../../../core/api/generated';
import { confirmAction } from '../../../shared/dialogs/confirm-dialog';
import { describeError } from '../../../shared/errors/describe-error';
import { applyApiErrors, setApiError } from '../../../shared/errors/form-errors';
import { formatDateTime } from '../../../shared/format/date-time';
import { fieldMessage } from '../../../shared/forms/account-rules';
import { emailDomainRules, normalizeEmailDomain } from '../../../shared/forms/domain-rules';
import { AsyncState } from '../../../shared/states/async-state';
import { FormErrorSummary } from '../../../shared/states/form-error-summary';

/** Domínios por página da lista (o padrão da API). */
export const DOMAINS_PAGE_SIZE = 20;

/** De onde veio o domínio (`origin`), como o administrador lê. */
export function originLabel(origin: BlockedEmailDomain['origin']): string {
  return origin === 'SEED' ? 'Carga inicial' : 'Administrador';
}

/**
 * Blacklist de domínios de e-mail (UC13, RF29, RF22; #28), só para `ADMIN` (a rota pede o papel):
 * a lista em ordem alfabética, paginada, com origem e data; incluir um domínio, com a regra da API,
 * gravado em minúsculas (fluxos 3–4); e remover, depois de confirmar (fluxo 3.1). O efeito é
 * imediato: o domínio passa (ou deixa) de barrar cadastros e trocas de e-mail na hora.
 */
@Component({
  selector: 'bios-blocked-domains-page',
  imports: [
    AsyncState,
    FormErrorSummary,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './blocked-domains-page.html',
  styleUrl: './blocked-domains-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockedDomainsPage {
  private readonly api = inject(BiosApi);
  private readonly dialog = inject(MatDialog);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly formatDate = formatDateTime;
  protected readonly originLabel = originLabel;
  protected readonly messageOf = fieldMessage;

  protected readonly form = new FormGroup({
    domain: new FormControl('', { nonNullable: true, validators: [emailDomainRules] }),
  });

  protected readonly page = signal(1);
  protected readonly domains = resource({
    params: () => this.page(),
    loader: ({ params: page }) =>
      this.api.listBlockedEmailDomains({ query: { page, page_size: DOMAINS_PAGE_SIZE } }),
  });

  protected readonly items = computed(() =>
    this.domains.hasValue() ? this.domains.value().data : [],
  );
  protected readonly pagination = computed(() =>
    this.domains.hasValue() ? this.domains.value().pagination : null,
  );

  protected readonly adding = signal(false);
  protected readonly formErrors = signal<string[]>([]);
  /** O domínio sendo removido, para travar o botão dele. */
  protected readonly removing = signal<string | null>(null);
  /** Resultado da última ação, anunciado ao leitor de tela. */
  protected readonly notice = signal<string | null>(null);
  protected readonly removeError = signal<string | null>(null);

  private readonly listHeading = viewChild<ElementRef<HTMLElement>>('listHeading');

  protected goTo(page: number): void {
    this.page.set(page);
    this.focusListHeading();
  }

  protected async add(): Promise<void> {
    if (this.adding()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusInvalidDomain();
      return;
    }

    const domain = normalizeEmailDomain(this.form.getRawValue().domain);
    this.adding.set(true);
    this.formErrors.set([]);
    this.notice.set(null);
    this.removeError.set(null);

    try {
      const added = await this.api.addBlockedEmailDomain({ body: { domain } });

      this.form.reset();
      this.notice.set(
        `Domínio ${added.domain} bloqueado. Cadastros com ele são recusados a partir de agora.`,
      );
      this.domains.reload();
    } catch (error) {
      const view = describeError(error);

      // Já bloqueado (fluxo 4.1): o problema é o valor do campo, e o aviso fica nele.
      if (view.code === 'BLOCKED_EMAIL_DOMAIN_ALREADY_EXISTS') {
        setApiError(this.form.controls.domain, view.message);
      } else {
        this.formErrors.set(applyApiErrors(this.form, view));
      }
      this.focusInvalidDomain();
    } finally {
      this.adding.set(false);
    }
  }

  protected async remove(item: BlockedEmailDomain): Promise<void> {
    if (this.removing()) return;

    const confirmed = await confirmAction(this.dialog, {
      title: `Remover ${item.domain} da blacklist?`,
      message:
        'Cadastros e trocas de e-mail com este domínio voltam a ser aceitos na hora. Para ' +
        'bloqueá-lo de novo, basta incluí-lo outra vez.',
      confirmLabel: 'Remover',
    });

    if (!confirmed) return;

    this.removing.set(item.id);
    this.notice.set(null);
    this.removeError.set(null);
    let pageChanged = false;

    try {
      await this.api.removeBlockedEmailDomain({ path: { id: item.id } });
      this.notice.set(`Domínio ${item.domain} removido da blacklist.`);
      // Era o único da última página: volta à anterior, em vez de mostrar uma página vazia.
      if (this.items().length === 1 && this.page() > 1) {
        this.page.update((page) => page - 1);
        pageChanged = true;
      }
    } catch (error) {
      const view = describeError(error);

      this.removeError.set(
        view.code === 'BLOCKED_EMAIL_DOMAIN_NOT_FOUND'
          ? `${view.message} A lista foi atualizada.`
          : view.message,
      );
    } finally {
      this.removing.set(null);
      // Trocar de página já recarrega a lista.
      if (!pageChanged) this.domains.reload();
      // A linha some: o foco vai ao título da lista, e não ao começo da página.
      this.focusListHeading();
    }
  }

  private focusListHeading(): void {
    afterNextRender(() => this.listHeading()?.nativeElement.focus(), { injector: this.injector });
  }

  private focusInvalidDomain(): void {
    afterNextRender(
      () => {
        this.host.nativeElement.querySelector<HTMLElement>('input[aria-invalid="true"]')?.focus();
      },
      { injector: this.injector },
    );
  }
}
