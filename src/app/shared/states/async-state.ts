import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { EmptyState } from './empty-state';
import { ErrorState } from './error-state';
import { LoadingState } from './loading-state';

/**
 * Os estados de uma tela que carrega dados, sempre iguais (#16): carregando, erro, vazio e, por
 * fim, o conteúdo projetado. A região fica com `aria-busy` enquanto espera.
 *
 * ```html
 * <bios-async-state [loading]="carregando()" [error]="erro()" [empty]="!itens().length"
 *   emptyMessage="Nenhuma empresa atende aos filtros." (retry)="recarregar()">
 *   ...lista...
 * </bios-async-state>
 * ```
 */
@Component({
  selector: 'bios-async-state',
  imports: [EmptyState, ErrorState, LoadingState],
  template: `
    <div [attr.aria-busy]="loading()">
      @if (loading()) {
        <bios-loading [label]="loadingLabel()" />
      } @else if (error() !== null && error() !== undefined) {
        <bios-error-state [error]="error()" (retry)="retry.emit()" />
      } @else if (empty()) {
        <bios-empty-state [message]="emptyMessage()" />
      } @else {
        <ng-content />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsyncState {
  readonly loading = input(false);
  readonly error = input<unknown>(null);
  readonly empty = input(false);
  readonly emptyMessage = input.required<string>();
  readonly loadingLabel = input('Carregando…');

  readonly retry = output();
}
