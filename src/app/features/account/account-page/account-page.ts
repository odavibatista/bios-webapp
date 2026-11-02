import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { type AbstractControl, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { OwnAccount } from '../../../core/account/own-account';
import type { AccountResponse } from '../../../core/api/generated';
import { SessionStore } from '../../../core/session/session-store';
import { roleLabel } from '../../../layout/panel-nav';
import { confirmAction } from '../../../shared/dialogs/confirm-dialog';
import { describeError } from '../../../shared/errors/describe-error';
import { applyApiErrors } from '../../../shared/errors/form-errors';
import { fieldMessage, nameRules } from '../../../shared/forms/account-rules';
import {
  addressFieldRules,
  type AddressField,
  type AddressValue,
  BRAZILIAN_STATES,
  formatPostalCode,
  isBlankAddress,
} from '../../../shared/forms/address-rules';
import { AsyncState } from '../../../shared/states/async-state';
import { FormErrorSummary } from '../../../shared/states/form-error-summary';
import { accountChanges, accountFormValue } from '../account-changes';
import { confirmAccountDeletion } from '../delete-account-dialog/delete-account-dialog';

/** O aviso que a página inicial mostra depois da exclusão (`/?conta=excluida`). */
export const ACCOUNT_DELETED_PARAM = { conta: 'excluida' } as const;

/**
 * Painel da conta (UC05, RF26; #23): os dados de quem entrou (nome, e-mail, endereço e papel) e a
 * edição do nome e do endereço. A edição envia só o que mudou, e "Salvar" só habilita quando algo
 * mudou; o que a tela mostra depois é o que a API devolveu. "Remover endereço" pede confirmação e
 * envia `address: null`.
 *
 * "Excluir conta" (UC05, fluxos 1.2 e 1.3; #30) abre a confirmação com a senha; excluída, a sessão
 * local some e o app volta à página inicial, com o aviso. A troca de e-mail (FE-13) entra como
 * outra seção desta página.
 */
@Component({
  selector: 'bios-account-page',
  imports: [
    AsyncState,
    FormErrorSummary,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './account-page.html',
  styleUrl: './account-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountPage {
  private readonly own = inject(OwnAccount);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly account = this.own.account;
  protected readonly states = BRAZILIAN_STATES;
  protected readonly roleLabel = roleLabel;
  protected readonly formatPostalCode = formatPostalCode;
  protected readonly messageOf = fieldMessage;

  /** Com endereço gravado, os campos dele são obrigatórios (para tirá-lo, "Remover endereço"). */
  private readonly hasSavedAddress = computed(
    () => this.account.hasValue() && this.account.value().address !== null,
  );

  /**
   * O endereço é cobrado se já existe ou se a pessoa começou a preenchê-lo. Olha o grupo pelo
   * controle (`parent`), porque os validadores rodam já na criação, antes de `form` existir.
   */
  private readonly addressRequired = (control: AbstractControl) =>
    untracked(this.hasSavedAddress) ||
    (control.parent !== null && !isBlankAddress(control.parent.getRawValue() as AddressValue));

  /** A conta que o formulário mostra agora: o efeito não repõe o que a tela já repôs. */
  private shown: AccountResponse | null = null;

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [nameRules] }),
    address: new FormGroup({
      postal_code: this.addressControl('postal_code'),
      street: this.addressControl('street'),
      number: this.addressControl('number'),
      complement: this.addressControl('complement'),
      neighborhood: this.addressControl('neighborhood'),
      city: this.addressControl('city'),
      state: this.addressControl('state'),
    }),
  });

  /** Muda a cada edição, toque, reset ou erro da API: recalcula o que mudou. */
  private readonly formState = toSignal(this.form.events);

  /** O que "Salvar" enviaria; `null` quando nada mudou. */
  protected readonly changes = computed(() => {
    this.formState();

    return this.account.hasValue()
      ? accountChanges(this.account.value(), this.form.getRawValue())
      : null;
  });

  protected readonly saving = signal(false);
  protected readonly formErrors = signal<string[]>([]);
  /** O aviso depois de gravar, anunciado ao leitor de tela. */
  protected readonly notice = signal('');

  constructor() {
    // O formulário mostra o que está gravado: ao carregar e depois de cada gravação.
    effect(() => {
      if (!this.account.hasValue()) return;

      const account = this.account.value();
      if (account === this.shown) return;
      untracked(() => {
        this.resetTo(account);
      });
    });

    // Começar ou desfazer o preenchimento do endereço muda o que é obrigatório nos outros campos.
    let wasBlank = isBlankAddress(this.form.controls.address.getRawValue());
    this.form.controls.address.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      const blank = isBlankAddress(value);

      if (blank === wasBlank) return;
      wasBlank = blank;
      for (const control of Object.values(this.form.controls.address.controls)) {
        control.updateValueAndValidity({ emitEvent: false });
      }
    });
  }

  /** Máscara do CEP enquanto a pessoa digita: só dígitos, com o hífen depois do quinto. */
  protected maskPostalCode(): void {
    const control = this.form.controls.address.controls.postal_code;
    const masked = formatPostalCode(control.value);

    if (masked !== control.value) control.setValue(masked);
  }

  protected async save(): Promise<void> {
    const body = this.changes();

    if (this.saving() || !body) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }

    this.saving.set(true);
    this.formErrors.set([]);
    this.notice.set('');

    try {
      this.resetTo(await this.own.update(body));
      this.notice.set('Dados salvos.');
    } catch (error) {
      this.formErrors.set(applyApiErrors(this.form, describeError(error)));
      this.focusFirstInvalid();
    } finally {
      this.saving.set(false);
    }
  }

  /** Tira o endereço da conta, depois de confirmar; o nome digitado e ainda não salvo continua. */
  protected async removeAddress(): Promise<void> {
    if (this.saving()) return;

    const confirmed = await confirmAction(this.dialog, {
      title: 'Remover o endereço?',
      message: 'O endereço deixa de ficar guardado na sua conta. Você pode informar outro depois.',
      confirmLabel: 'Remover endereço',
    });

    if (!confirmed) return;

    const typedName = this.form.controls.name.value;
    this.saving.set(true);
    this.formErrors.set([]);
    this.notice.set('');

    try {
      this.resetTo(await this.own.update({ address: null }));
      this.form.controls.name.setValue(typedName);
      this.notice.set('Endereço removido.');
    } catch (error) {
      this.formErrors.set([describeError(error).message]);
    } finally {
      this.saving.set(false);
    }
  }

  /**
   * Exclui a conta depois da confirmação com a senha. A API já encerrou a sessão (UC05, regra 6):
   * aqui só falta apagar a local, sem chamar o logout, que receberia um 401.
   */
  protected async deleteAccount(): Promise<void> {
    if (!(await confirmAccountDeletion(this.dialog))) return;

    this.session.clear();
    await this.router.navigate(['/'], { queryParams: ACCOUNT_DELETED_PARAM });
  }

  private addressControl(field: AddressField): FormControl<string> {
    return new FormControl('', {
      nonNullable: true,
      validators: [addressFieldRules(field, (control) => this.addressRequired(control))],
    });
  }

  private resetTo(account: AccountResponse): void {
    this.shown = account;
    this.form.reset(accountFormValue(account));
  }

  private focusFirstInvalid(): void {
    afterNextRender(
      () => {
        this.host.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      },
      { injector: this.injector },
    );
  }
}
