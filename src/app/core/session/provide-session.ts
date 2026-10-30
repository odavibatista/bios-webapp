import { inject, makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';
import { ApiCredentials } from '../api/api-credentials';
import { BIOS_API_IMPLEMENTATION, BiosApi } from '../api/bios-api';
import { renewingBiosApi } from './renewing-bios-api';
import { SessionService } from './session.service';
import { SessionStore } from './session-store';

/**
 * Liga a sessão à camada de dados (#15): o token das operações privadas sai do `SessionStore`, e
 * o `BiosApi` que as telas recebem renova a sessão sozinho. Vem depois do provedor da API em
 * `app.config.ts`, porque substitui o `BiosApi` dele.
 */
export function provideSession(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: ApiCredentials, useExisting: SessionStore },
    {
      provide: BiosApi,
      useFactory: () =>
        renewingBiosApi(
          inject(BIOS_API_IMPLEMENTATION),
          inject(SessionStore),
          inject(SessionService),
        ),
    },
  ]);
}
