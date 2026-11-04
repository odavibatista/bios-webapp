import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { BIOS_API_IMPLEMENTATION } from '../api/bios-api';
import { provideMockBiosApi } from '../mocks/provide-mock-bios-api';
import { PRESENTATION_MODE } from '../presentation-mode';
import { DEMO_ENTRY_PATH, enterDemo } from './demo-entry.guard';
import { PANEL_PATH } from './return-url';
import { provideSession } from './provide-session';
import { LOGIN_PATH, SessionService } from './session.service';
import { SessionStore } from './session-store';

@Component({ template: '' })
class Screen {}

async function open(extra: object[] = []) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([
        { path: DEMO_ENTRY_PATH, canActivate: [enterDemo], children: [] },
        { path: '**', component: Screen },
      ]),
      provideMockBiosApi({ latencyMs: 0 }),
      provideSession(),
      ...extra,
    ],
  });

  const harness = await RouterTestingHarness.create();

  return { harness, router: TestBed.inject(Router), store: TestBed.inject(SessionStore) };
}

describe('entrada da demonstração', () => {
  it('entra com a conta de demonstração e leva ao painel', async () => {
    const { harness, router, store } = await open();

    await harness.navigateByUrl(`/${DEMO_ENTRY_PATH}`);

    expect(router.url).toBe(PANEL_PATH);
    expect(store.user()).toMatchObject({ name: 'Conta de Demonstração', role: 'USER' });
  });

  it('a senha não aparece na URL', async () => {
    const { harness, router } = await open();

    await harness.navigateByUrl(`/${DEMO_ENTRY_PATH}`);

    expect(router.url).not.toContain('Apresentacao2026');
  });

  it('com sessão aberta, só leva ao painel, sem entrar de novo', async () => {
    const { harness, router } = await open();
    const session = TestBed.inject(SessionService);

    await session.signIn('administracao@example.com', 'Apresentacao2026');
    const signIn = vi.spyOn(session, 'signIn');

    await harness.navigateByUrl(`/${DEMO_ENTRY_PATH}`);

    expect(router.url).toBe(PANEL_PATH);
    expect(signIn).not.toHaveBeenCalled();
  });

  it('fora da versão de apresentação, leva ao login e não entra', async () => {
    const { harness, router, store } = await open([
      { provide: PRESENTATION_MODE, useValue: false },
    ]);

    await harness.navigateByUrl(`/${DEMO_ENTRY_PATH}`);

    expect(router.url).toBe(LOGIN_PATH);
    expect(store.isAuthenticated()).toBe(false);
  });

  it('se o login falhar, leva à tela de login', async () => {
    const { harness, router } = await open([
      {
        provide: BIOS_API_IMPLEMENTATION,
        useValue: { login: () => Promise.reject(new Error('fora do ar')) },
      },
    ]);

    await harness.navigateByUrl(`/${DEMO_ENTRY_PATH}`);

    expect(router.url).toBe(LOGIN_PATH);
  });
});
