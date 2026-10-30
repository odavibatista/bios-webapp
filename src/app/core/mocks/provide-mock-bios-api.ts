import { makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';
import { ApiCredentials, InMemoryApiCredentials } from '../api/api-credentials';
import { BIOS_API_IMPLEMENTATION, BiosApi } from '../api/bios-api';
import { PRESENTATION_MODE } from '../presentation-mode';
import { MockBiosApi } from './mock-bios-api';
import { DEFAULT_MOCK_API_CONFIG, MOCK_API_CONFIG, type MockApiConfig } from './mock-config';

/**
 * Liga o contrato `BiosApi` à implementação mockada, que responde com as capturas da API real.
 * Trocar pela API real é trocar este provedor em `app.config.ts`; as telas não mudam.
 */
export function provideMockBiosApi(config: Partial<MockApiConfig> = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: MOCK_API_CONFIG, useValue: { ...DEFAULT_MOCK_API_CONFIG, ...config } },
    InMemoryApiCredentials,
    { provide: ApiCredentials, useExisting: InMemoryApiCredentials },
    MockBiosApi,
    { provide: BIOS_API_IMPLEMENTATION, useExisting: MockBiosApi },
    // Sem `provideSession()`, as telas usam o provedor cru (é o caso dos testes do mock).
    { provide: BiosApi, useExisting: MockBiosApi },
    { provide: PRESENTATION_MODE, useValue: true },
  ]);
}
