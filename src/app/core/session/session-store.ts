import { computed, Injectable, signal } from '@angular/core';
import { ApiCredentials } from '../api/api-credentials';
import type { SessionResponse } from '../api/generated';

/** A sessão aberta: os tokens e quem entrou, como a API os devolve no login e na renovação. */
export interface Session {
  accessToken: string;
  refreshToken: string;
  user: SessionResponse['user'];
}

/**
 * Onde a sessão fica (#15). Só em memória: recarregar a página encerra a sessão local, e nenhum
 * token vai para `localStorage` ou `sessionStorage`, onde um script injetado o leria.
 *
 * É também o `ApiCredentials` da camada de dados: o provedor da API lê daqui o access token.
 */
@Injectable({ providedIn: 'root' })
export class SessionStore extends ApiCredentials {
  private readonly current = signal<Session | null>(null);

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
    this.current.set({
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      user: response.user,
    });
  }

  clear(): void {
    this.current.set(null);
  }
}
