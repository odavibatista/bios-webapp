import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { ApiError } from '../../core/api/api-error';
import { BiosApi } from '../../core/api/bios-api';
import { PRESENTATION_MODE } from '../../core/presentation-mode';
import type { CompanyMovementItem, ListCompanyMovementsResponse } from '../../core/api/generated';
import { SessionStore } from '../../core/session/session-store';
import {
  MOVEMENTS_PAGE_SIZE,
  NO_MOVEMENTS_MESSAGE,
  PAGE_WITHOUT_MOVEMENTS_MESSAGE,
  PANEL_SHORTCUTS,
  PanelHome,
} from './panel-home';

function item(cnpj: string, legalName: string): CompanyMovementItem {
  return {
    cnpj,
    legal_name: legalName,
    trade_name: null,
    city: 'SÃO PAULO',
    uf: 'SP',
    moved_at: '2026-11-03T00:00:00.000Z',
    ods: [],
  };
}

function page(
  data: CompanyMovementItem[],
  pagination: Partial<ListCompanyMovementsResponse['pagination']> = {},
): ListCompanyMovementsResponse {
  return {
    data,
    pagination: {
      page: 1,
      page_size: MOVEMENTS_PAGE_SIZE,
      total: data.length,
      total_pages: data.length ? 1 : 0,
      ...pagination,
    },
  };
}

describe('PanelHome', () => {
  const listCompanyMovements = vi.fn<BiosApi['listCompanyMovements']>();

  async function renderHome(inputs: { pagina?: string } = {}, presentation = false) {
    return render(PanelHome, {
      inputs,
      providers: [
        provideRouter([]),
        { provide: BiosApi, useValue: { listCompanyMovements } },
        { provide: PRESENTATION_MODE, useValue: presentation },
      ],
      configureTestBed: () => {
        TestBed.inject(SessionStore).store({
          access_token: 'a',
          refresh_token: 'r',
          token_type: 'Bearer',
          expires_in: 900,
          user: { id: '1', name: 'Conta de Demonstração', role: 'USER' },
        });
      },
    });
  }

  beforeEach(() => {
    listCompanyMovements.mockReset();
    listCompanyMovements.mockResolvedValue(page([item('33592510000154', 'Empresa Um')]));
  });

  it('cumprimenta pelo primeiro nome', async () => {
    await renderHome();

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Olá, Conta');
  });

  it('na apresentação usa saudação neutra', async () => {
    await renderHome({}, true);

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Olá!');
  });

  it('traz o campo de consulta por CNPJ logo no topo', async () => {
    await renderHome();

    const lookup = screen.getByRole('region', { name: 'Buscar uma empresa pelo CNPJ ou nome' });
    expect(lookup.querySelector('bios-cnpj-search')).not.toBeNull();
    expect(screen.getByRole('search', { name: 'Buscar empresa por CNPJ ou nome' })).toBeTruthy();
  });

  it('lista as empresas na ordem da API, cada uma levando ao perfil', async () => {
    listCompanyMovements.mockResolvedValue(
      page([item('33592510000154', 'Empresa Um'), item('11222333000181', 'Empresa Dois')]),
    );
    await renderHome();

    const links = await screen.findAllByRole('link', { name: /^Empresa/ });

    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/empresas/33592510000154',
      '/empresas/11222333000181',
    ]);
    expect(listCompanyMovements).toHaveBeenCalledWith({
      query: { page: 1, page_size: MOVEMENTS_PAGE_SIZE },
    });
  });

  it('avisa que a mudança não é um julgamento da conduta (IND03)', async () => {
    await renderHome();

    expect(screen.getByText(/não diz que a conduta da empresa melhorou ou piorou/)).toBeTruthy();
  });

  it('lê a página da URL', async () => {
    await renderHome({ pagina: '3' });

    await screen.findByRole('link', { name: 'Empresa Um' });
    expect(listCompanyMovements).toHaveBeenLastCalledWith({
      query: { page: 3, page_size: MOVEMENTS_PAGE_SIZE },
    });
  });

  it('página inválida na URL vale como a primeira', async () => {
    await renderHome({ pagina: 'abc' });

    await screen.findByRole('link', { name: 'Empresa Um' });
    expect(listCompanyMovements).toHaveBeenLastCalledWith({
      query: { page: 1, page_size: MOVEMENTS_PAGE_SIZE },
    });
  });

  it('com uma página só, não mostra a navegação', async () => {
    await renderHome();

    await screen.findByRole('link', { name: 'Empresa Um' });
    expect(screen.queryByRole('navigation', { name: 'Páginas das movimentações' })).toBeNull();
  });

  it('a próxima página fica na URL, e a primeira, sem parâmetro', async () => {
    listCompanyMovements.mockResolvedValue(
      page([item('33592510000154', 'Empresa Um')], { page: 2, total: 60, total_pages: 3 }),
    );
    await renderHome({ pagina: '2' });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const user = userEvent.setup();

    expect((await screen.findByText('Página 2 de 3')).textContent).toBe('Página 2 de 3');

    await user.click(screen.getByRole('button', { name: 'Próxima página' }));
    expect(navigate).toHaveBeenLastCalledWith(
      [],
      expect.objectContaining({ queryParams: { pagina: 3 } }),
    );

    await user.click(screen.getByRole('button', { name: 'Página anterior' }));
    expect(navigate).toHaveBeenCalledTimes(2);
  });

  it('nas pontas, o botão sem destino fica desativado', async () => {
    listCompanyMovements.mockResolvedValue(
      page([item('33592510000154', 'Empresa Um')], { total: 60, total_pages: 3 }),
    );
    await renderHome();

    const previous = await screen.findByRole<HTMLButtonElement>('button', {
      name: 'Página anterior',
    });
    const next = screen.getByRole<HTMLButtonElement>('button', { name: 'Próxima página' });

    expect(previous.disabled).toBe(true);
    expect(next.disabled).toBe(false);
  });

  it('voltar à primeira página tira o parâmetro da URL', async () => {
    listCompanyMovements.mockResolvedValue(
      page([item('33592510000154', 'Empresa Um')], { page: 2, total: 60, total_pages: 3 }),
    );
    await renderHome({ pagina: '2' });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Página anterior' }));

    expect(navigate).toHaveBeenCalledWith([], expect.objectContaining({ queryParams: {} }));
  });

  it('sem movimentações, explica e oferece os caminhos de entrada (UC18, 2.1)', async () => {
    listCompanyMovements.mockResolvedValue(page([]));
    await renderHome();

    expect(await screen.findByText(NO_MOVEMENTS_MESSAGE)).toBeTruthy();
    for (const shortcut of PANEL_SHORTCUTS) {
      expect(
        screen.getByRole('link', { name: new RegExp(shortcut.title) }).getAttribute('href'),
      ).toBe(shortcut.path);
    }
  });

  it('página além do fim não finge que a base está vazia', async () => {
    listCompanyMovements.mockResolvedValue(page([], { page: 9, total: 60, total_pages: 3 }));
    await renderHome({ pagina: '9' });

    expect(await screen.findByText(PAGE_WITHOUT_MOVEMENTS_MESSAGE)).toBeTruthy();
    expect(screen.queryByRole('link', { name: /Consultar uma empresa/ })).toBeNull();
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeTruthy();
  });

  it('falha na lista oferece nova tentativa, e a busca segue na tela (UC18, 2.2)', async () => {
    listCompanyMovements.mockRejectedValueOnce(
      new ApiError(503, {
        statusCode: 503,
        code: 'SERVICE_UNAVAILABLE',
        message: 'Serviço indisponível.',
        timestamp: '2026-11-04T00:00:00.000Z',
        path: '/companies/movements',
      }),
    );
    await renderHome();

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByRole('link', { name: 'Empresa Um' })).toBeTruthy();
    expect(screen.getByRole('search', { name: 'Buscar empresa por CNPJ ou nome' })).toBeTruthy();
  });
});
