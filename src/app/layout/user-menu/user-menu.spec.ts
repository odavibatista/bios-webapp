import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { BiosApi } from '../../core/api/bios-api';
import type { AccountResponse } from '../../core/api/generated';
import type { Role } from '../../core/session/role.guards';
import { SessionStore } from '../../core/session/session-store';
import { UserMenu } from './user-menu';

const ACCOUNT: AccountResponse = {
  id: '1',
  name: 'Nome Editado',
  email: 'apresentacao@example.com',
  address: null,
  role: 'USER',
};

async function renderMenu(
  getOwnAccount: () => Promise<AccountResponse>,
  role: Role | null = 'USER',
) {
  return render(UserMenu, {
    providers: [provideRouter([]), { provide: BiosApi, useValue: { getOwnAccount } }],
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
});
