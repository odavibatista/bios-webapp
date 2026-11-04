import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BiosApi } from '../api/bios-api';
import { MockMailbox } from '../mocks/mock-mailbox';
import { provideMockBiosApi } from '../mocks/provide-mock-bios-api';
import { provideSession } from './provide-session';
import { SessionService } from './session.service';
import { SessionStore } from './session-store';
import { TabStorage } from './tab-storage';

const USER = 'apresentacao@example.com';
const PASSWORD = 'Apresentacao2026';
const VISITOR = 'visitante@example.com';
const VISITOR_PASSWORD = 'SenhaDoVisitante123';

function openTab(storage = true): void {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      provideMockBiosApi({ latencyMs: 0 }),
      provideSession(),
      ...(storage ? [TabStorage] : []),
    ],
  });
}

function savedText(): string {
  return JSON.stringify({ ...sessionStorage });
}

async function createConfirmedVisitor(): Promise<void> {
  const api = TestBed.inject(BiosApi);

  await api.registerAccount({
    body: { name: 'Visitante', email: VISITOR, password: VISITOR_PASSWORD },
  });

  const link = TestBed.inject(MockMailbox).latest(VISITOR, 'confirmar-email')!.link;

  await api.confirmEmail({ body: { token: link.split('/').at(-1)! } });
}

describe('sessão da aba na versão de apresentação', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it('recarregar mantém a sessão, e a conta continua respondendo', async () => {
    openTab();
    await TestBed.inject(SessionService).signIn(USER, PASSWORD);

    openTab();

    expect(TestBed.inject(SessionStore).isAuthenticated()).toBe(true);
    await expect(TestBed.inject(BiosApi).getOwnAccount()).resolves.toMatchObject({ email: USER });
  });

  it('sair apaga a sessão guardada', async () => {
    openTab();
    await TestBed.inject(SessionService).signIn(USER, PASSWORD);
    await TestBed.inject(SessionService).signOut();

    openTab();

    expect(TestBed.inject(SessionStore).isAuthenticated()).toBe(false);
  });

  it('a conta criada e os e-mails sobrevivem, e a senha digitada nunca é guardada', async () => {
    openTab();
    await createConfirmedVisitor();

    expect(savedText()).toContain(VISITOR);
    expect(savedText()).not.toContain(VISITOR_PASSWORD);

    openTab();

    expect(TestBed.inject(MockMailbox).emails()).toHaveLength(1);
    await expect(
      TestBed.inject(SessionService).signIn(VISITOR, 'SenhaErrada123'),
    ).rejects.toMatchObject({ status: 401 });
    await expect(
      TestBed.inject(SessionService).signIn(VISITOR, VISITOR_PASSWORD),
    ).resolves.toMatchObject({ user: { name: 'Visitante' } });
  });

  it('sem `TabStorage`, nada vai para o navegador (#15)', async () => {
    openTab(false);
    await TestBed.inject(SessionService).signIn(USER, PASSWORD);

    expect(sessionStorage.length).toBe(0);

    openTab(false);

    expect(TestBed.inject(SessionStore).isAuthenticated()).toBe(false);
  });

  it('armazenamento bloqueado não impede entrar', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('bloqueado', 'SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('bloqueado', 'SecurityError');
    });
    openTab();

    await TestBed.inject(SessionService).signIn(USER, PASSWORD);

    expect(TestBed.inject(SessionStore).isAuthenticated()).toBe(true);
  });

  it('dado corrompido é ignorado, e a demonstração recomeça', async () => {
    sessionStorage.setItem('bios.sessao.v1', '{quebrado');
    sessionStorage.setItem('bios.demonstracao.v1', '{quebrado');
    sessionStorage.setItem('bios.caixa-de-saida.v1', '{quebrado');
    openTab();

    expect(TestBed.inject(SessionStore).isAuthenticated()).toBe(false);
    await expect(TestBed.inject(SessionService).signIn(USER, PASSWORD)).resolves.toBeTruthy();
  });
});
