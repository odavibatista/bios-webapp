import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BIOS_API_IMPLEMENTATION } from '../api/bios-api';
import type { SessionResponse } from '../api/generated';
import { SessionStore } from './session-store';

/** Rota de login (FE-09) e os parâmetros que a sessão lhe passa. */
export const LOGIN_PATH = '/entrar';

/**
 * Abre, renova e encerra a sessão (UC02, UC03, UC17). Usa o provedor cru do contrato: entrar e
 * renovar não passam pela renovação automática, que depende deles.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly api = inject(BIOS_API_IMPLEMENTATION);
  private readonly store = inject(SessionStore);
  private readonly router = inject(Router);
  private renewing: Promise<boolean> | null = null;

  /** Entra com e-mail e senha e guarda a sessão; erros da API sobem para a tela. */
  async signIn(email: string, password: string): Promise<SessionResponse> {
    const session = await this.api.login({ body: { email, password } });

    this.store.store(session);

    return session;
  }

  /**
   * Sai neste dispositivo, ou em todos. A sessão local é apagada mesmo que a chamada falhe
   * (UC03, pós-condição: nenhum token continua valendo no app).
   */
  async signOut(everywhere = false): Promise<void> {
    try {
      await (everywhere ? this.api.logoutAllDevices() : this.api.logout());
    } finally {
      this.store.clear();
    }
  }

  /**
   * Renova o access token com o refresh token (UC17). Pedidos simultâneos usam a mesma
   * renovação: dois `refreshSession` com o mesmo refresh token seriam lidos pela API como reuso
   * e encerrariam todas as sessões (fluxo 4.1). Se a renovação falhar, a sessão local é apagada e
   * o app vai para o login, guardando onde o usuário estava.
   */
  renew(): Promise<boolean> {
    this.renewing ??= this.refresh().finally(() => {
      this.renewing = null;
    });

    return this.renewing;
  }

  private async refresh(): Promise<boolean> {
    const refreshToken = this.store.refreshToken();

    if (!refreshToken) return false;

    try {
      this.store.store(await this.api.refreshSession({ body: { refresh_token: refreshToken } }));

      return true;
    } catch {
      this.store.clear();
      await this.router.navigate([LOGIN_PATH], {
        queryParams: { voltar: this.router.url, sessao: 'encerrada' },
      });

      return false;
    }
  }
}
