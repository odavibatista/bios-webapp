import { DOCUMENT } from '@angular/common';
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
import {
  type AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  type ValidatorFn,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { OwnAccount } from '../../../core/account/own-account';
import { BiosApi } from '../../../core/api/bios-api';
import type { AccountResponse, PostalAddress } from '../../../core/api/generated';
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
  postalCodeDigits,
} from '../../../shared/forms/address-rules';
import { chosenCityRule, CityField } from '../../../shared/forms/city-field/city-field';
import { AsyncState } from '../../../shared/states/async-state';
import { FormErrorSummary } from '../../../shared/states/form-error-summary';
import { accountChanges, accountFormValue } from '../account-changes';
import { confirmAccountDeletion } from '../delete-account-dialog/delete-account-dialog';
import { EmailChange } from '../email-change/email-change';

/** O aviso que a página inicial mostra depois da exclusão (`/?conta=excluida`). */
export const ACCOUNT_DELETED_PARAM = { conta: 'excluida' } as const;

/**
 * Painel da conta (UC05, RF26; #23): os dados de quem entrou (nome, e-mail, endereço e papel) e a
 * edição do nome e do endereço. A edição envia só o que mudou, e "Salvar" só habilita quando algo
 * mudou; o que a tela mostra depois é o que a API devolveu. "Remover endereço" pede confirmação e
 * envia `address: null`.
 *
 * "Excluir conta" (UC05, fluxos 1.2 e 1.3; #30) abre a confirmação com a senha; excluída, a sessão
 * local some e o app volta à página inicial, com o aviso. "Trocar e-mail" (#29) pede o novo
 * endereço e a senha atual; o e-mail mostrado continua o atual até a confirmação pelo link.
 */
@Component({
  selector: 'bios-account-page',
  imports: [
    AsyncState,
    CityField,
    EmailChange,
    FormErrorSummary,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './account-page.html',
  styleUrl: './account-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountPage {
  private readonly api = inject(BiosApi);
  private readonly own = inject(OwnAccount);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);

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
      state: this.addressControl('state'),
      city: this.addressControl('city', [
        chosenCityRule(() => (this.account.hasValue() ? this.account.value().address?.city : null)),
      ]),
      city_ibge_code: this.addressControl('city_ibge_code'),
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

  /** Consulta de CEP em andamento. */
  protected readonly lookingUpCep = signal(false);
  /** O resultado da consulta, anunciado ao leitor de tela. */
  protected readonly cepNotice = signal('');
  /** Endereço do CEP à espera de confirmação: há campos preenchidos com outros valores. */
  protected readonly pendingAddress = signal<PostalAddress | null>(null);
  /** O último CEP consultado: a resposta de um CEP já trocado é ignorada. */
  private lastCep = '';

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

    void this.lookupPostalCode(postalCodeDigits(masked));
  }

  /**
   * Com os 8 dígitos, completa o endereço (UC05, RF39). Falhar nunca impede salvar: a mensagem
   * libera o preenchimento à mão. Só preenche direto o que está em branco ou igual; se houver algo
   * diferente, pergunta antes de trocar. Número e complemento não vêm do CEP e ficam como estão.
   */
  private async lookupPostalCode(cep: string): Promise<void> {
    if (cep === this.lastCep) return;

    this.lastCep = cep;
    this.lookingUpCep.set(false);
    this.pendingAddress.set(null);
    this.cepNotice.set('');
    if (cep.length < 8) return;

    this.lookingUpCep.set(true);

    try {
      const address = await this.api.lookupPostalCode({ path: { cep } });

      if (cep !== this.lastCep) return;

      if (this.wouldReplaceTypedAddress(address)) {
        this.pendingAddress.set(address);
        this.cepNotice.set('Este CEP tem outro endereço. Confira abaixo se quer usá-lo.');
      } else {
        this.fillFromPostalCode(address);
      }
    } catch (error) {
      if (cep === this.lastCep) this.cepNotice.set(describeError(error).message);
    } finally {
      if (cep === this.lastCep) this.lookingUpCep.set(false);
    }
  }

  private wouldReplaceTypedAddress(address: PostalAddress): boolean {
    const { street, neighborhood, state, city } = this.form.controls.address.getRawValue();
    const differs = (typed: string, found: string | null) =>
      typed.trim() !== '' && found !== null && typed.trim() !== found;

    return (
      differs(street, address.street) ||
      differs(neighborhood, address.neighborhood) ||
      differs(state, address.state) ||
      differs(city, address.city)
    );
  }

  protected usePendingAddress(): void {
    const address = this.pendingAddress();

    if (address) this.fillFromPostalCode(address);
  }

  protected keepTypedAddress(): void {
    this.pendingAddress.set(null);
    this.cepNotice.set('');
  }

  private fillFromPostalCode(address: PostalAddress): void {
    const {
      street,
      neighborhood,
      state,
      city,
      city_ibge_code: code,
    } = this.form.controls.address.controls;

    if (address.street !== null) street.setValue(address.street);
    if (address.neighborhood !== null) neighborhood.setValue(address.neighborhood);
    state.setValue(address.state);
    city.setValue(address.city);
    code.setValue(address.city_ibge_code ?? '');
    city.updateValueAndValidity();
    this.pendingAddress.set(null);
    this.cepNotice.set(
      address.street === null
        ? 'Cidade preenchida. Este CEP é geral: informe o logradouro e o bairro.'
        : 'Endereço preenchido pelo CEP. Confira os campos.',
    );

    // Quem ainda está no CEP segue para o número; quem já saiu do campo não perde o lugar.
    if (this.document.activeElement === this.fieldOf('postal_code')) {
      this.fieldOf(address.street === null ? 'street' : 'number')?.focus();
    }
  }

  private fieldOf(name: 'postal_code' | 'street' | 'number'): HTMLElement | null {
    return this.host.nativeElement.querySelector(`[formcontrolname="${name}"]`);
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

  private addressControl(field: AddressField, validators: ValidatorFn[] = []): FormControl<string> {
    return new FormControl('', {
      nonNullable: true,
      validators: [
        addressFieldRules(field, (control) => this.addressRequired(control)),
        ...validators,
      ],
    });
  }

  /** Trocar a UF desfaz o município escolhido, que era de outra lista (RF38). */
  protected clearCity(): void {
    const { city, city_ibge_code: code } = this.form.controls.address.controls;

    city.setValue('');
    code.setValue('');
  }

  private resetTo(account: AccountResponse): void {
    this.shown = account;
    this.form.reset(accountFormValue(account));
    this.lastCep = postalCodeDigits(this.form.controls.address.controls.postal_code.value);
    this.pendingAddress.set(null);
    this.cepNotice.set('');
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
