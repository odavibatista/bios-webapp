import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { CnpjSearch } from './cnpj-search';

@Component({ template: '<h1>Destino</h1>' })
class Destination {}

async function renderSearch(inputs: { variant?: 'form' | 'toolbar'; initial?: string } = {}) {
  const result = await render(CnpjSearch, {
    inputs,
    providers: [provideRouter([{ path: '**', component: Destination }])],
  });

  return { ...result, user: userEvent.setup(), router: TestBed.inject(Router) };
}

describe('CnpjSearch', () => {
  it('CNPJ com máscara abre o perfil pelo CNPJ normalizado, sem a máscara na URL', async () => {
    const { user, router } = await renderSearch();

    await user.type(screen.getByLabelText('CNPJ ou nome da empresa'), '33.592.510/0001-54');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    await vi.waitFor(() => {
      expect(router.url).toBe('/empresas/33592510000154');
    });
  });

  it('CNPJ alfanumérico em minúsculas vai em maiúsculas', async () => {
    const { user, router } = await renderSearch();

    await user.type(screen.getByLabelText('CNPJ ou nome da empresa'), '12.abc.345/01de-35{Enter}');

    await vi.waitFor(() => {
      expect(router.url).toBe('/empresas/12ABC34501DE35');
    });
  });

  it('nome abre a lista e texto curto ou longo é recusado no campo', async () => {
    const { user, router } = await renderSearch();
    const field = screen.getByLabelText('CNPJ ou nome da empresa');

    await user.type(field, 'Aço Cearense{Enter}');
    await vi.waitFor(() => expect(router.url).toBe('/empresas?nome=A%C3%A7o%20Cearense'));

    await user.clear(field);
    await user.type(field, 'SA{Enter}');
    expect(screen.getByText('Informe ao menos uma palavra com 3 letras ou mais.')).toBeTruthy();
    expect(router.url).toContain('nome=');

    await user.clear(field);
    await user.type(field, `${'A'.repeat(101)}{Enter}`);
    expect(screen.getByText('O nome deve ter no máximo 100 caracteres.')).toBeTruthy();
  });

  it('CNPJ inválido mostra o erro no campo, ligado a ele, e não sai da tela', async () => {
    const { user, router, fixture } = await renderSearch();
    const navigate = vi.spyOn(router, 'navigate');

    await user.type(screen.getByLabelText('CNPJ ou nome da empresa'), '33.592.510/0001-55');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await fixture.whenStable();

    const field = screen.getByLabelText('CNPJ ou nome da empresa');
    const error = screen.getByText('CNPJ inválido. Confira os dígitos e tente de novo.');
    expect(field.getAttribute('aria-invalid')).toBe('true');
    expect(field.getAttribute('aria-describedby')).toContain(error.closest('mat-error')?.id);
    expect(document.activeElement).toBe(field);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('sair do campo vazio não acusa erro; a dica aparece antes', async () => {
    const { user } = await renderSearch();

    await user.click(screen.getByLabelText('CNPJ ou nome da empresa'));
    await user.tab();

    expect(screen.queryByText(/CNPJ inválido/)).toBeNull();
    expect(
      screen.getByText('CNPJ numérico ou alfanumérico, ou razão social ou nome fantasia.'),
    ).toBeTruthy();
  });

  it('o CNPJ que já veio digitado é conferido ao abrir', async () => {
    await renderSearch({ initial: '123' });

    expect(screen.getByText('CNPJ inválido. Confira os dígitos e tente de novo.')).toBeTruthy();
    expect(screen.getByLabelText('CNPJ ou nome da empresa')).toHaveProperty('value', '123');
  });

  describe('na barra do topo', () => {
    it('CNPJ válido abre o perfil e limpa o campo', async () => {
      const { user, router } = await renderSearch({ variant: 'toolbar' });
      const field = screen.getByLabelText('Buscar empresa por CNPJ ou nome');

      await user.type(field, '33592510000154');
      await user.click(screen.getByRole('button', { name: 'Buscar empresa' }));

      await vi.waitFor(() => {
        expect(router.url).toBe('/empresas/33592510000154');
      });
      expect(field).toHaveProperty('value', '');
    });

    it('CNPJ inválido leva à consulta, que mostra o erro no campo completo', async () => {
      const { user, router } = await renderSearch({ variant: 'toolbar' });

      await user.type(screen.getByLabelText('Buscar empresa por CNPJ ou nome'), '123{Enter}');

      await vi.waitFor(() => {
        expect(router.url).toBe('/empresas?cnpj=123');
      });
    });

    it('nome vai para a lista de empresas', async () => {
      const { user, router } = await renderSearch({ variant: 'toolbar' });
      await user.type(screen.getByLabelText('Buscar empresa por CNPJ ou nome'), 'Cearense{Enter}');
      await vi.waitFor(() => expect(router.url).toBe('/empresas?nome=Cearense'));
    });
  });
});
