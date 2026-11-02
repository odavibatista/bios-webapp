import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { fireEvent, render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { ApiError } from '../../../core/api/api-error';
import { BiosApi } from '../../../core/api/bios-api';
import { confirmAccountDeletion, DELETED_ON_ACCOUNT_REMOVAL } from './delete-account-dialog';

@Component({ template: '' })
class Host {
  readonly dialog = inject(MatDialog);
}

function apiError(status: number, code: string, message: string): ApiError {
  return new ApiError(status, {
    statusCode: status,
    code,
    message,
    timestamp: '2026-11-02T12:00:00.000Z',
    path: '/accounts/me',
  });
}

async function openDialog(deleteOwnAccount: ReturnType<typeof vi.fn>) {
  const { fixture } = await render(Host, {
    providers: [{ provide: BiosApi, useValue: { deleteOwnAccount } }],
  });
  let answer: boolean | null = null;
  void confirmAccountDeletion(fixture.componentInstance.dialog).then((result) => {
    answer = result;
  });
  await screen.findByRole('alertdialog', { name: 'Excluir a sua conta?' });

  // O user-event só entra quando pedido: ver o teste da exclusão confirmada.
  return { user: () => userEvent.setup(), answer: () => answer };
}

const deleteButton = () => screen.getByRole('button', { name: 'Excluir conta' });

/**
 * Informa a senha e confirma com `fireEvent`, sem o user-event: depois da resposta da API, os
 * ouvintes de foco que o user-event põe no documento disparariam a detecção de mudanças dentro de
 * outra (NG0101). Isso só acontece no teste; no app, ninguém detecta mudanças a cada evento.
 */
function submitPassword(password: string): void {
  fireEvent.input(screen.getByLabelText('Senha'), { target: { value: password } });
  fireEvent.click(deleteButton());
}

/** O diálogo que ficou aberto depois de um erro continua usável: "Cancelar" o fecha. */
async function closeByCancel(answer: () => boolean | null): Promise<void> {
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  await vi.waitFor(() => {
    expect(answer()).toBe(false);
  });
}

describe('confirmAccountDeletion', () => {
  it('explica o que será apagado e põe "Cancelar" antes de excluir', async () => {
    await openDialog(vi.fn());

    const dialog = screen.getByRole('alertdialog');
    for (const item of DELETED_ON_ACCOUNT_REMOVAL) {
      expect(dialog.textContent).toContain(item);
    }
    const buttons = screen.getAllByRole('button').map((button) => button.textContent.trim());
    expect(buttons.indexOf('Cancelar')).toBeLessThan(buttons.indexOf('Excluir conta'));
    expect(screen.getByRole('button', { name: 'Cancelar' }).hasAttribute('cdkfocusinitial')).toBe(
      true,
    );
  });

  it('"Excluir conta" só habilita com a senha preenchida', async () => {
    const user = (await openDialog(vi.fn())).user();

    expect(deleteButton().hasAttribute('disabled')).toBe(true);
    await user.type(screen.getByLabelText('Senha'), 'x');
    expect(deleteButton().hasAttribute('disabled')).toBe(false);
    await user.clear(screen.getByLabelText('Senha'));
    expect(deleteButton().hasAttribute('disabled')).toBe(true);
  });

  it('com a senha certa, exclui e fecha com true', async () => {
    const remove = vi.fn(() => Promise.resolve());
    const { answer } = await openDialog(remove);

    submitPassword('Apresentacao2026');

    expect(remove).toHaveBeenCalledWith({ body: { password: 'Apresentacao2026' } });
    await vi.waitFor(() => {
      expect(answer()).toBe(true);
    });
  });

  it('senha errada mantém o diálogo aberto, com o erro no campo', async () => {
    const remove = vi.fn(() =>
      Promise.reject(apiError(422, 'INVALID_CURRENT_PASSWORD', 'A senha atual está incorreta.')),
    );
    const { answer } = await openDialog(remove);

    submitPassword('senha-errada');

    expect(await screen.findByText('A senha atual está incorreta.')).toBeTruthy();
    expect(screen.getByLabelText('Senha').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('alertdialog')).toBeTruthy();
    expect(answer()).toBeNull();
    await closeByCancel(answer);
  });

  it('outra falha aparece no diálogo, que continua aberto', async () => {
    const remove = vi.fn(() =>
      Promise.reject(apiError(503, 'DEPENDENCY_UNAVAILABLE', 'Serviço indisponível no momento.')),
    );
    const { answer } = await openDialog(remove);

    submitPassword('Apresentacao2026');

    expect((await screen.findByRole('alert')).textContent).toBe('Serviço indisponível no momento.');
    expect(answer()).toBeNull();
    await closeByCancel(answer);
  });

  it('cancelar fecha sem excluir', async () => {
    const remove = vi.fn();
    const { user: setupUser, answer } = await openDialog(remove);
    const user = setupUser();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    await vi.waitFor(() => {
      expect(answer()).toBe(false);
    });
    expect(remove).not.toHaveBeenCalled();
  });

  it('Esc fecha sem excluir', async () => {
    const remove = vi.fn();
    const { answer } = await openDialog(remove);

    // O CDK confere o `keyCode`, que o user-event não preenche.
    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape', keyCode: 27 });

    await vi.waitFor(() => {
      expect(answer()).toBe(false);
    });
    expect(remove).not.toHaveBeenCalled();
  });
});
