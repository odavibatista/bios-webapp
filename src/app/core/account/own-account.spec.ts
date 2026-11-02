import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BiosApi } from '../api/bios-api';
import type { AccountResponse } from '../api/generated';
import { SessionStore } from '../session/session-store';
import { OwnAccount } from './own-account';

const ACCOUNT: AccountResponse = {
  id: '1',
  name: 'Conta de Demonstração',
  email: 'apresentacao@example.com',
  address: null,
  role: 'USER',
};

function setup() {
  const api = {
    getOwnAccount: vi.fn(() => Promise.resolve(ACCOUNT)),
    updateOwnAccount: vi.fn(() => Promise.resolve({ ...ACCOUNT, name: 'Nome Novo' })),
  };
  TestBed.configureTestingModule({ providers: [{ provide: BiosApi, useValue: api }] });

  return { api, store: TestBed.inject(SessionStore), own: TestBed.inject(OwnAccount) };
}

function signIn(store: SessionStore, id = '1') {
  store.store({
    access_token: 'a',
    refresh_token: 'r',
    token_type: 'Bearer',
    expires_in: 900,
    user: { id, name: 'Conta de Demonstração', role: 'USER' },
  });
}

describe('OwnAccount', () => {
  it('sem sessão, não carrega nada', async () => {
    const { api, own } = setup();

    await TestBed.inject(ApplicationRef).whenStable();

    expect(api.getOwnAccount).not.toHaveBeenCalled();
    expect(own.account.hasValue()).toBe(false);
  });

  it('com sessão, carrega a conta; ao trocar de pessoa, recarrega', async () => {
    const { api, store, own } = setup();

    signIn(store);
    await vi.waitFor(() => {
      expect(own.account.value()?.email).toBe('apresentacao@example.com');
    });

    signIn(store, '2');
    await vi.waitFor(() => {
      expect(api.getOwnAccount).toHaveBeenCalledTimes(2);
    });
  });

  it('a edição passa a valer para quem lê, com o que a API devolveu, sem outra leitura', async () => {
    const { api, store, own } = setup();
    signIn(store);
    await vi.waitFor(() => {
      expect(own.account.hasValue()).toBe(true);
    });

    const updated = await own.update({ name: 'Nome Novo' });

    expect(api.updateOwnAccount).toHaveBeenCalledWith({ body: { name: 'Nome Novo' } });
    expect(updated.name).toBe('Nome Novo');
    expect(own.account.value()?.name).toBe('Nome Novo');
    expect(api.getOwnAccount).toHaveBeenCalledTimes(1);
  });

  it('se a edição falhar, o erro sobe e a conta mostrada não muda', async () => {
    const { api, store, own } = setup();
    signIn(store);
    await vi.waitFor(() => {
      expect(own.account.hasValue()).toBe(true);
    });
    api.updateOwnAccount.mockRejectedValueOnce(new Error('falha'));

    await expect(own.update({ name: 'Outro' })).rejects.toThrow('falha');
    expect(own.account.value()?.name).toBe('Conta de Demonstração');
  });
});
