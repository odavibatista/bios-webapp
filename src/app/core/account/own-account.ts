import { inject, Injectable, resource } from '@angular/core';
import { BiosApi } from '../api/bios-api';
import type { AccountResponse, UpdateAccountRequest } from '../api/generated';
import { SessionStore } from '../session/session-store';

/**
 * A conta de quem entrou (UC05), num lugar só: o menu da conta e a página `/conta` leem daqui.
 * Carrega quando a sessão abre e recarrega quando muda a pessoa; sem sessão, fica vazia. Uma
 * edição grava a resposta da API aqui, e quem lê vê o dado novo na hora, sem outra chamada.
 */
@Injectable({ providedIn: 'root' })
export class OwnAccount {
  private readonly api = inject(BiosApi);
  private readonly store = inject(SessionStore);

  readonly account = resource({
    params: () => this.store.user()?.id,
    loader: () => this.api.getOwnAccount(),
  });

  /** Grava a edição e passa a mostrar os dados que a API devolveu. Erros sobem para a tela. */
  async update(body: UpdateAccountRequest): Promise<AccountResponse> {
    const updated = await this.api.updateOwnAccount({ body });

    this.account.set(updated);

    return updated;
  }
}
