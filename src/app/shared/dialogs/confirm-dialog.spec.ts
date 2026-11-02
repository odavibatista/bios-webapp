import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { fireEvent, render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { confirmAction } from './confirm-dialog';

@Component({ template: '' })
class Host {
  readonly dialog = inject(MatDialog);
}

async function openConfirm() {
  const { fixture } = await render(Host);
  const answer = confirmAction(fixture.componentInstance.dialog, {
    title: 'Sair de todos os dispositivos?',
    message: 'As sessões abertas em outros aparelhos também serão encerradas.',
    confirmLabel: 'Sair de todos',
  });
  await fixture.whenStable();

  return { answer, fixture, user: userEvent.setup() };
}

describe('confirmAction', () => {
  // O foco inicial em "Cancelar" fica no e2e: o jsdom não calcula layout, e o CDK não acha
  // elemento focável nele.
  it('pergunta num alertdialog nomeado pelo título', async () => {
    await openConfirm();

    const dialog = await screen.findByRole('alertdialog', {
      name: 'Sair de todos os dispositivos?',
    });
    expect(dialog.textContent).toContain(
      'As sessões abertas em outros aparelhos também serão encerradas.',
    );
    expect(screen.getByRole('button', { name: 'Cancelar' }).hasAttribute('cdkfocusinitial')).toBe(
      true,
    );
  });

  it('confirmar responde true', async () => {
    const { answer, user } = await openConfirm();

    await user.click(await screen.findByRole('button', { name: 'Sair de todos' }));

    await expect(answer).resolves.toBe(true);
  });

  it('cancelar responde false', async () => {
    const { answer, user } = await openConfirm();

    await user.click(await screen.findByRole('button', { name: 'Cancelar' }));

    await expect(answer).resolves.toBe(false);
  });

  it('Esc responde false', async () => {
    const { answer } = await openConfirm();

    // O CDK confere o `keyCode`, que o user-event não preenche.
    fireEvent.keyDown(await screen.findByRole('alertdialog'), { key: 'Escape', keyCode: 27 });

    await expect(answer).resolves.toBe(false);
  });
});
