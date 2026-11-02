import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { fireEvent, render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { showCreatedKey } from './created-key-dialog';

@Component({ template: '' })
class Host {
  readonly dialog = inject(MatDialog);
}

const KEY = 'bios_ZvdVkOaC_segredo-de-demonstracao';

function stubClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
}

async function openDialog() {
  const { fixture } = await render(Host);
  let closed = false;
  void showCreatedKey(fixture.componentInstance.dialog, {
    name: 'Planilha de fornecedores',
    key: KEY,
  }).then(() => {
    closed = true;
  });
  await screen.findByRole('dialog', { name: 'Chave gerada' });

  return { fixture, user: userEvent.setup(), isClosed: () => closed };
}

describe('CreatedKeyDialog', () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'clipboard');
  });

  it('mostra a chave completa com o aviso de que não será exibida de novo', async () => {
    await openDialog();

    const dialog = screen.getByRole('dialog', { name: 'Chave gerada' });
    expect(dialog.textContent).toContain(KEY);
    expect(dialog.textContent).toContain('Copie a chave agora: ela não será mostrada de novo.');
    expect(dialog.textContent).toContain('Planilha de fornecedores');
  });

  // O `userEvent.setup()` (dentro de `openDialog`) troca o `navigator.clipboard` pelo dublê dele:
  // o nosso entra depois.
  it('copiar leva a chave à área de transferência e anuncia "Chave copiada"', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    const { user } = await openDialog();
    stubClipboard(writeText);

    await user.click(screen.getByRole('button', { name: 'Copiar a chave' }));

    expect(writeText).toHaveBeenCalledWith(KEY);
    expect(await screen.findByRole('button', { name: 'Chave copiada' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('Chave copiada');
  });

  it('se a cópia falhar, explica e deixa a chave selecionada para o Ctrl+C', async () => {
    await openDialog();
    stubClipboard(() => Promise.reject(new Error('sem permissão')));

    // `fireEvent`, e não o `user.click`: o ponteiro simulado do user-event mexe na seleção do
    // documento e disputa com a seleção que a tela faz (falhava com a máquina carregada).
    fireEvent.click(screen.getByRole('button', { name: 'Copiar a chave' }));

    expect(await screen.findByText(/Não foi possível copiar automaticamente/)).toBeTruthy();
    await vi.waitFor(
      () => {
        expect(window.getSelection()?.toString()).toBe(KEY);
      },
      { timeout: 3000 },
    );
    expect(screen.getByRole('status').textContent).toContain('Não foi possível copiar');
  });

  it('sem a API de área de transferência, cai no mesmo caminho da falha', async () => {
    const { user } = await openDialog();
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });

    await user.click(screen.getByRole('button', { name: 'Copiar a chave' }));

    expect(await screen.findByText(/Não foi possível copiar automaticamente/)).toBeTruthy();
  });

  it('só fecha pelo botão: Esc não descarta a chave sem querer', async () => {
    const { user, isClosed } = await openDialog();

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', keyCode: 27 });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isClosed()).toBe(false);

    await user.click(screen.getByRole('button', { name: 'Já guardei a chave' }));
    await vi.waitFor(() => {
      expect(isClosed()).toBe(true);
    });
    await vi.waitFor(() => {
      expect(document.body.textContent).not.toContain(KEY);
    });
  });
});
