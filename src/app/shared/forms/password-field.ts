import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { type FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { startWith, switchMap } from 'rxjs';
import { fieldMessage, PASSWORD_POLICY } from './account-rules';

/**
 * Campo de senha (#19): com o botão de mostrar a senha e, na senha nova, a política visível antes
 * do primeiro erro (UC01, regra 4). A dica e o erro ficam ligados ao campo por `aria-describedby`
 * (o `mat-form-field` cuida disso).
 */
@Component({
  selector: 'bios-password-field',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  template: `
    <mat-form-field appearance="outline" class="field">
      <mat-label>{{ label() }}</mat-label>
      <input
        matInput
        [type]="visible() ? 'text' : 'password'"
        [formControl]="control()"
        [attr.autocomplete]="autocomplete()"
      />
      <button
        mat-icon-button
        matSuffix
        type="button"
        [attr.aria-label]="visible() ? 'Ocultar senha' : 'Mostrar senha'"
        [attr.aria-pressed]="visible()"
        (click)="visible.set(!visible())"
      >
        <mat-icon fontSet="material-symbols-outlined" aria-hidden="true">
          {{ visible() ? 'visibility_off' : 'visibility' }}
        </mat-icon>
      </button>
      @if (showPolicy()) {
        <mat-hint>{{ policy }}</mat-hint>
      }
      <mat-error>{{ message() }}</mat-error>
    </mat-form-field>
  `,
  styles: `
    .field {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordField {
  readonly control = input.required<FormControl<string>>();
  readonly label = input('Senha');
  /** `new-password` no cadastro e na troca; `current-password` no login. */
  readonly autocomplete = input<'new-password' | 'current-password'>('new-password');
  /** Mostra a política de senha (senha nova). */
  readonly showPolicy = input(false);

  protected readonly policy = PASSWORD_POLICY;
  protected readonly visible = signal(false);

  /** Muda a cada edição, toque ou erro vindo da API, para o erro aparecer na hora. */
  private readonly state = toSignal(
    toObservable(this.control).pipe(switchMap((control) => control.events.pipe(startWith(null)))),
  );

  protected readonly message = computed(() => {
    this.state();

    return fieldMessage(this.control());
  });
}
