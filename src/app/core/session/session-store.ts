import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiCredentials } from '../api/api-credentials';
import type { SessionResponse } from '../api/generated';
import { TabStorage } from './tab-storage';

const SESSION_KEY = 'bios.sessao.v1';

/** A sessão aberta: os tokens e quem entrou, como a API os devolve no login e na renovação. */
export interface Session {
  accessToken: string;
  refreshToken: string;
  user: SessionResponse['user'];
}

/**
 * Onde a sessão fica (#15). Só em memória: nenhum token de verdade vai para `localStorage` ou
 * `sessionStorage`, onde um script injetado o leria. A exceção é a versão de apresentação, que
 * fornece `TabStorage`: lá os tokens são do mock, e a sessão acaba ao fechar a aba.
 *
 * É também o `ApiCredentials` da camada de dados: o provedor da API lê daqui o access token.
 */
@Injectable({ providedIn: 'root' })
export class SessionStore extends ApiCredentials {
  private readonly storage = inject(TabStorage, { optional: true });
  private readonly current = signal(this.storage?.read<Session>(SESSION_KEY) ?? null);

  /** A sessão aberta, ou `null`. */
  readonly session = this.current.asReadonly();

  /** Quem entrou: nome e papel vêm do último token (o do login ou o da renovação). */
  readonly user = computed(() => this.current()?.user ?? null);

  readonly isAuthenticated = computed(() => this.current() !== null);

  accessToken(): string | null {
    return this.current()?.accessToken ?? null;
  }

  refreshToken(): string | null {
    return this.current()?.refreshToken ?? null;
  }

  /** Guarda a sessão aberta no login, ou o par novo de uma renovação (UC17, regra 5). */
  store(response: SessionResponse): void {
    const session: Session = {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      user: response.user,
    };

    this.current.set(session);
    this.storage?.write(SESSION_KEY, session);
  }

  clear(): void {
    this.current.set(null);
    this.storage?.remove(SESSION_KEY);
  }
}
