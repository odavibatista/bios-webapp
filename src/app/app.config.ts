import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
import localePt from '@angular/common/locales/pt';
import {
  ApplicationConfig,
  inject,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideEnvironmentInitializer,
} from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withNavigationErrorHandler,
} from '@angular/router';
import { routes } from './app.routes';
import { COMPANY_ARCHIVE_PROVIDERS } from './core/mocks/company-archive.providers';
import { provideMockBiosApi } from './core/mocks/provide-mock-bios-api';
import { handleNavigationFailure } from './core/navigation/navigation-failure';
import { ScrollMemory } from './core/navigation/scroll-memory';
import { provideSession } from './core/session/provide-session';
import { TabStorage } from './core/session/tab-storage';

// Datas, números e moeda no formato brasileiro (`1.234,5`, `29/10/2026`).
registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      // O roteador guarda as posições; quem as aplica é o `ScrollMemory`.
      withInMemoryScrolling({ scrollPositionRestoration: 'disabled' }),
      withNavigationErrorHandler(handleNavigationFailure),
    ),
    provideEnvironmentInitializer(() => {
      inject(ScrollMemory).start();
    }),
    provideHttpClient(withFetch()),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { floatLabel: 'always', subscriptSizing: 'dynamic' },
    },
    // Versão de apresentação: a camada de dados responde com as capturas da API real (#14).
    provideMockBiosApi(),
    COMPANY_ARCHIVE_PROVIDERS,
    // Só com o mock: recarregar a página mantém a demonstração, e fechar a aba a encerra.
    TabStorage,
    // Sessão: o token vem dela, e o contrato renova o acesso sozinho (#15). Depois da API.
    provideSession(),
  ],
};
