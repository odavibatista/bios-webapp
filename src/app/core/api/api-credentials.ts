import { Injectable } from '@angular/core';

/**
 * De onde a camada de dados tira o access token da sessão aberta. O provedor HTTP o envia no
 * `Authorization`; o mockado o confere como a API conferiria. O serviço de sessão (FE-05) é
 * quem o mantém; sem sessão, as operações privadas respondem `401 NOT_AUTHENTICATED`.
 */
export abstract class ApiCredentials {
  abstract accessToken(): string | null;
}

/** Guarda o token em memória: o padrão até existir o serviço de sessão. */
@Injectable()
export class InMemoryApiCredentials extends ApiCredentials {
  private token: string | null = null;

  accessToken(): string | null {
    return this.token;
  }

  setAccessToken(token: string | null): void {
    this.token = token;
  }
}
