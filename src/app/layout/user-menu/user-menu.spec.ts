import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { BiosApi } from '../../core/api/bios-api';
import type { AccountResponse } from '../../core/api/generated';
import type { Role } from '../../core/session/role.guards';
import { SessionService } from '../../core/session/session.service';
import { SessionStore } from '../../core/session/session-store';
import { UserMenu } from './user-menu';

@Component({ template: '<h1>Tela</h1>' })
class Screen {}

const ACCOUNT: AccountResponse = {
  id: '1',
  name: 'Nome Editado',
  email: 'apresentacao@example.com',
  address: null,
  role: 'USER',
};

/** Como o `SessionService` real: apaga a sessão local, e a chamada pode falhar. */
function fakeSession(fails = false) {
  return {
    signOut: vi.fn(() => {
      TestBed.inject(SessionStore).clear();

      return fails ? Promise.reject(new Error('rede fora do ar')) : Promise.resolve();
    }),
  };
}

async function renderMenu(
  getOwnAccount: () => Promise<AccountResponse>,
  role: Role | null = 'USER',
  session = fakeSession(),
) {
  const result = await render(UserMenu, {
    providers: [
      provideRouter([{ path: '**', component: Screen }]),
      { provide: BiosApi, useValue: { getOwnAccount } },
      { provide: SessionService, useValue: session },
    ],
    configureTestBed: () => {
      if (!role) return;
      TestBed.inject(SessionStore).store({
        access_token: 'a',
        refresh_token: 'r',
        token_type: 'Bearer',
        expires_in: 900,
        user: { id: '1', name: 'Nome da Sessão', role },
      });
    },
  });

  return { ...result, session, user: userEvent.setup() };
}

async function openMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: /Nome Editado/ }));
}

describe('UserMenu', () => {
  it('sem sessão, não aparece', async () => {
    const getOwnAccount = vi.fn(() => Promise.resolve(ACCOUNT));

    await renderMenu(getOwnAccount, null);

    expect(screen.queryByRole('button')).toBeNull();
    expect(getOwnAccount).not.toHaveBeenCalled();
  });

  it('enquanto a conta carrega, mostra o esqueleto e o papel, nunca "undefined"', async () => {
    await renderMenu(() => new Promise<AccountResponse>(() => undefined));

    const trigger = screen.getByRole('button');

    expect(trigger.textContent).toContain('Carregando a conta');
    expect(trigger.textContent).toContain('Usuário');
    expect(trigger.textContent).not.toContain('undefined');
  });

  it('com a conta carregada, mostra o nome dela; o menu traz o e-mail e "Minha conta"', async () => {
    const { fixture } = await renderMenu(() => Promise.resolve(ACCOUNT), 'ADMIN');

    await fixture.whenStable();
    const trigger = screen.getByRole('button', { name: /Nome Editado/ });

    expect(trigger.textContent).toContain('Administrador');
    trigger.click();
    await fixture.whenStable();

    expect(await screen.findByText('apresentacao@example.com')).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: /Minha conta/ }).getAttribute('href')).toBe(
      '/conta',
    );
  });

  it('se a conta não carregar, mostra o nome da sessão', async () => {
    const { fixture } = await renderMenu(() => Promise.reject(new Error('falha')));

    await fixture.whenStable();

    expect(screen.getByRole('button', { name: /Nome da Sessão/ })).toBeTruthy();
  });

  describe('sair (#21)', () => {
    it('"Sair" encerra só esta sessão e leva ao login', async () => {
      const { user, session } = await renderMenu(() => Promise.resolve(ACCOUNT));

      await openMenu(user);
      await user.click(await screen.findByRole('menuitem', { name: 'Sair' }));

      expect(session.signOut).toHaveBeenCalledWith(false);
      await vi.waitFor(() => {
        expect(TestBed.inject(Router).url).toBe('/entrar');
      });
      expect(TestBed.inject(SessionStore).isAuthenticated()).toBe(false);
    });

    it('se a chamada falhar, a sessão local some e o app vai ao login do mesmo jeito', async () => {
      const { user } = await renderMenu(() => Promise.resolve(ACCOUNT), 'USER', fakeSession(true));

      await openMenu(user);
      await user.click(await screen.findByRole('menuitem', { name: 'Sair' }));

      await vi.waitFor(() => {
        expect(TestBed.inject(Router).url).toBe('/entrar');
      });
      expect(TestBed.inject(SessionStore).isAuthenticated()).toBe(false);
    });

    it('"Sair de todos os dispositivos" pede confirmação antes de encerrar todas', async () => {
      const { user, session } = await renderMenu(() => Promise.resolve(ACCOUNT));

      await openMenu(user);
      await user.click(
        await screen.findByRole('menuitem', { name: /Sair de todos os dispositivos/ }),
      );
      expect(session.signOut).not.toHaveBeenCalled();

      await user.click(await screen.findByRole('button', { name: 'Sair de todos' }));

      await vi.waitFor(() => {
        expect(TestBed.inject(Router).url).toBe('/entrar');
      });
      expect(session.signOut).toHaveBeenCalledWith(true);
    });

    it('cancelar a confirmação mantém a sessão', async () => {
      const { user, session } = await renderMenu(() => Promise.resolve(ACCOUNT));
      const router = TestBed.inject(Router);
      await router.navigateByUrl('/painel');

      await openMenu(user);
      await user.click(
        await screen.findByRole('menuitem', { name: /Sair de todos os dispositivos/ }),
      );
      await user.click(await screen.findByRole('button', { name: 'Cancelar' }));

      await vi.waitFor(() => {
        expect(screen.queryByRole('alertdialog')).toBeNull();
      });
      expect(session.signOut).not.toHaveBeenCalled();
      expect(router.url).toBe('/painel');
      expect(TestBed.inject(SessionStore).isAuthenticated()).toBe(true);
    });
  });
});
