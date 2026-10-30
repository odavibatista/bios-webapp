import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
import localePt from '@angular/common/locales/pt';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { provideMockBiosApi } from './core/mocks/provide-mock-bios-api';
import { provideSession } from './core/session/provide-session';

// Datas, números e moeda no formato brasileiro (`1.234,5`, `29/10/2026`).
registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch()),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    // Versão de apresentação: a camada de dados responde com as capturas da API real (#14).
    provideMockBiosApi(),
    // Sessão: o token vem dela, e o contrato renova o acesso sozinho (#15). Depois da API.
    provideSession(),
  ],
};
