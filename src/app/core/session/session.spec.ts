import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { ApiCredentials } from '../api/api-credentials';
import { ApiError } from '../api/api-error';
import { BIOS_API_IMPLEMENTATION, BiosApi } from '../api/bios-api';
import type { SessionResponse } from '../api/generated';
import { provideMockBiosApi } from '../mocks/provide-mock-bios-api';
import { privateByDefault } from './private-by-default.guard';
import { provideSession } from './provide-session';
import { SessionService } from './session.service';
import { SessionStore } from './session-store';

const USER = 'apresentacao@example.com';
const PASSWORD = 'Apresentacao2026';
const TTL_SECONDS = 60;

@Component({ template: 'tela' })
class Screen {}

let clock: number;

function setup(): void {
  clock = Date.parse('2026-10-30T12:00:00Z');
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{ path: '**', component: Screen }]),
      provideMockBiosApi({ latencyMs: 0, now: () => clock, accessTokenTtlSeconds: TTL_SECONDS }),
      provideSession(),
    ],
  });
}

function notAuthenticated(): ApiError {
  return new ApiError(401, {
    statusCode: 401,
    code: 'NOT_AUTHENTICATED',
    message: 'Autenticação necessária. Entre para continuar.',
    timestamp: '2026-10-30T12:00:00.000Z',
    path: '/accounts/me',
  });
}

function session(token: string, role: 'USER' | 'ADMIN' = 'USER'): SessionResponse {
  return {
    access_token: `acesso-${token}`,
    refresh_token: `renovacao-${token}`,
    token_type: 'Bearer',
    expires_in: TTL_SECONDS,
    user: { id: '1', name: 'Conta de Demonstração', role },
  };
}

describe('sessão (#15)', () => {
  beforeEach(() => {
    setup();
  });

  it('o token das operações vem da sessão aberta no login', async () => {
    const store = TestBed.inject(SessionStore);

    expect(TestBed.inject(ApiCredentials)).toBe(store);
    await TestBed.inject(SessionService).signIn(USER, PASSWORD);

    expect(store.isAuthenticated()).toBe(true);
    expect(store.user()).toMatchObject({ name: 'Conta de Demonstração', role: 'USER' });
    await expect(TestBed.inject(BiosApi).getOwnAccount()).resolves.toMatchObject({ email: USER });
  });

  it('login com erro não abre sessão, e o erro da API chega à tela', async () => {
    await expect(TestBed.inject(SessionService).signIn(USER, 'errada123')).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
    });
    expect(TestBed.inject(SessionStore).isAuthenticated()).toBe(false);
  });

  describe('renovação automática (UC17)', () => {
    it('token vencido: renova uma vez, guarda o par novo e repete a operação, sem sair da tela', async () => {
      const implementation = TestBed.inject(BIOS_API_IMPLEMENTATION);
      const refresh = vi.spyOn(implementation, 'refreshSession');
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigate');
      const store = TestBed.inject(SessionStore);

      await TestBed.inject(SessionService).signIn(USER, PASSWORD);
      const oldToken = store.accessToken();

      clock += (TTL_SECONDS + 1) * 1000;
      await expect(TestBed.inject(BiosApi).getOwnAccount()).resolves.toMatchObject({ email: USER });

      expect(refresh).toHaveBeenCalledTimes(1);
      expect(store.accessToken()).not.toBe(oldToken);
      expect(navigate).not.toHaveBeenCalled();
    });

    it('várias operações vencidas ao mesmo tempo disparam um só refreshSession (fluxo 4.1)', async () => {
      const refresh = vi.spyOn(TestBed.inject(BIOS_API_IMPLEMENTATION), 'refreshSession');
      const api = TestBed.inject(BiosApi);

      await TestBed.inject(SessionService).signIn(USER, PASSWORD);
      clock += (TTL_SECONDS + 1) * 1000;
      const results = await Promise.all([api.getOwnAccount(), api.listOds(), api.listApiKeys()]);

      expect(results).toHaveLength(3);
      expect(refresh).toHaveBeenCalledTimes(1);
    });

    it('renovação recusada apaga a sessão e leva ao login com o aviso e o destino (2.1, 3.1)', async () => {
      const implementation = TestBed.inject(BIOS_API_IMPLEMENTATION);
      const harness = await RouterTestingHarness.create('/empresas/60894730000105');
      const store = TestBed.inject(SessionStore);

      await TestBed.inject(SessionService).signIn(USER, PASSWORD);
      await implementation.logoutAllDevices();
      const failure = TestBed.inject(BiosApi).getOwnAccount();

      await expect(failure).rejects.toMatchObject({ code: 'NOT_AUTHENTICATED' });
      expect(store.isAuthenticated()).toBe(false);
      expect(TestBed.inject(Router).url).toBe(
        '/entrar?voltar=%2Fempresas%2F60894730000105&sessao=encerrada',
      );
      harness.fixture.destroy();
    });

    it('o papel exibido é o do token renovado, e não o do login (regra 5)', async () => {
      const implementation = TestBed.inject(BIOS_API_IMPLEMENTATION);
      const store = TestBed.inject(SessionStore);

      store.store(session('1', 'USER'));
      vi.spyOn(implementation, 'refreshSession').mockResolvedValue(session('2', 'ADMIN'));
      vi.spyOn(implementation, 'listOds')
        .mockRejectedValueOnce(notAuthenticated())
        .mockResolvedValueOnce({ data: [] });

      await TestBed.inject(BiosApi).listOds();

      expect(store.user()?.role).toBe('ADMIN');
    });

    it('sessão renovada durante a chamada: repete com o token novo, sem outro refreshSession', async () => {
      const implementation = TestBed.inject(BIOS_API_IMPLEMENTATION);
      const store = TestBed.inject(SessionStore);
      const refresh = vi.spyOn(implementation, 'refreshSession');

      store.store(session('1'));
      vi.spyOn(implementation, 'listOds')
        .mockImplementationOnce(() => {
          store.store(session('2'));

          return Promise.reject(notAuthenticated());
        })
        .mockResolvedValueOnce({ data: [] });

      await expect(TestBed.inject(BiosApi).listOds()).resolves.toEqual({ data: [] });
      expect(refresh).not.toHaveBeenCalled();
    });

    it('sem sessão, ou com outro erro, nada é renovado e o erro sobe', async () => {
      const refresh = vi.spyOn(TestBed.inject(BIOS_API_IMPLEMENTATION), 'refreshSession');
      const api = TestBed.inject(BiosApi);

      await expect(api.getOwnAccount()).rejects.toMatchObject({ code: 'NOT_AUTHENTICATED' });
      await TestBed.inject(SessionService).signIn(USER, PASSWORD);
      await expect(
        api.getCompanyProfile({ path: { cnpj: '12345678000100' } }),
      ).rejects.toMatchObject({
        code: 'INVALID_CNPJ',
      });
      expect(refresh).not.toHaveBeenCalled();
    });

    it('renovar sem refresh token não chama a API', async () => {
      const refresh = vi.spyOn(TestBed.inject(BIOS_API_IMPLEMENTATION), 'refreshSession');

      await expect(TestBed.inject(SessionService).renew()).resolves.toBe(false);
      expect(refresh).not.toHaveBeenCalled();
    });

    it('propriedades que não são operações passam direto', () => {
      const api = TestBed.inject(BiosApi);

      // `sequence` é um campo numérico do mock: não é envolvido pela renovação.
      expect(Reflect.get(api, 'sequence')).toBeTypeOf('number');
      expect(Reflect.get(api, 'naoExiste')).toBeUndefined();
    });
  });

  describe('sair (UC03)', () => {
    it('sai neste dispositivo e apaga a sessão local', async () => {
      const service = TestBed.inject(SessionService);
      const logout = vi.spyOn(TestBed.inject(BIOS_API_IMPLEMENTATION), 'logout');

      await service.signIn(USER, PASSWORD);
      await service.signOut();

      expect(logout).toHaveBeenCalledTimes(1);
      expect(TestBed.inject(SessionStore).isAuthenticated()).toBe(false);
    });

    it('sai de todos os dispositivos; a sessão local some mesmo se a chamada falhar', async () => {
      const service = TestBed.inject(SessionService);
      const logoutAll = vi
        .spyOn(TestBed.inject(BIOS_API_IMPLEMENTATION), 'logoutAllDevices')
        .mockRejectedValue(notAuthenticated());

      await service.signIn(USER, PASSWORD);
      await expect(service.signOut(true)).rejects.toBeInstanceOf(ApiError);

      expect(logoutAll).toHaveBeenCalledTimes(1);
      expect(TestBed.inject(SessionStore).isAuthenticated()).toBe(false);
    });
  });
});

describe('rotas privadas por padrão (RF02 c)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: '',
            canActivateChild: [privateByDefault],
            children: [
              { path: 'publica', data: { public: true }, component: Screen },
              { path: 'entrar', data: { public: true }, component: Screen },
              { path: 'privada', component: Screen },
            ],
          },
        ]),
      ],
    });
  });

  it('sem sessão, a rota privada leva ao login guardando o destino', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/privada?aba=evidencias');

    expect(TestBed.inject(Router).url).toBe('/entrar?voltar=%2Fprivada%3Faba%3Devidencias');
  });

  it('com sessão, a rota privada abre; a pública abre sempre', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/publica');
    expect(TestBed.inject(Router).url).toBe('/publica');

    TestBed.inject(SessionStore).store(session('1'));
    await harness.navigateByUrl('/privada');
    expect(TestBed.inject(Router).url).toBe('/privada');
  });
});
