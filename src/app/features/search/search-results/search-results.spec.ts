import { provideRouter } from '@angular/router';
import { render, screen, within } from '@testing-library/angular';
import type { CompanySearchItem } from '../../../core/api/generated';
import type { SearchOrder } from '../search-criteria';
import { SearchResults } from './search-results';

const SCORED: CompanySearchItem = {
  cnpj: '33592510000154',
  legal_name: 'EMPRESA DEMONSTRACAO S.A.',
  trade_name: 'DEMONSTRACAO',
  registration_status: 'ATIVA',
  city: 'OURO BRANCO',
  uf: 'MG',
  main_cnae: { code: '2451200', description: 'Fundição de ferro e aço' },
  ods_score: { ods_number: 13, score_value: -12.5, confidence_value: 0.62 },
};

const UNSCORED: CompanySearchItem = {
  ...SCORED,
  cnpj: '11222333000181',
  legal_name: 'OUTRA EMPRESA LTDA',
  trade_name: null,
  registration_status: 'BAIXADA',
  ods_score: { ods_number: 13, score_value: null, confidence_value: null },
};

async function renderResults(
  layout: 'table' | 'cards',
  odsLabel: string | null,
  items: CompanySearchItem[] = [SCORED, UNSCORED],
  order: SearchOrder | null = null,
) {
  return render(SearchResults, {
    inputs: { items, odsLabel, layout, order },
    providers: [provideRouter([])],
  });
}

describe('SearchResults', () => {
  it('tabela: resumo da empresa e, com ODS, índice e confiança em colunas separadas', async () => {
    await renderResults('table', 'ODS 13');

    const headers = screen.getAllByRole('columnheader').map((cell) => cell.textContent.trim());
    expect(headers).toEqual([
      'Empresa',
      'Situação',
      'Município',
      'CNAE principal',
      'Índice no ODS 13',
      'Confiança no ODS 13',
    ]);

    const [, first, second] = screen.getAllByRole('row');
    expect(within(first).getByRole('rowheader').textContent).toContain('33.592.510/0001-54');
    const firstCells = within(first)
      .getAllByRole('cell')
      .map((cell) => cell.textContent.trim());
    expect(firstCells).toEqual([
      'Ativa',
      'OURO BRANCO/MG',
      expect.stringContaining('2451-2/00'),
      '-12,5',
      '0,62',
    ]);
    const secondCells = within(second)
      .getAllByRole('cell')
      .map((cell) => cell.textContent.trim());
    expect(secondCells.slice(-2)).toEqual(['Sem índice', 'Sem cálculo']);
    expect(secondCells[0]).toBe('Baixada');
    const statuses = screen.getAllByText(/^(Ativa|Baixada)$/);
    expect(statuses[0].classList.contains('status-chip--other')).toBe(false);
    expect(statuses[1].classList.contains('status-chip--other')).toBe(true);
  });

  it('o nome leva ao perfil da empresa', async () => {
    await renderResults('table', null);

    expect(
      screen.getByRole('link', { name: 'EMPRESA DEMONSTRACAO S.A.' }).getAttribute('href'),
    ).toBe('/empresas/33592510000154');
  });

  it('formata o CNAE também no cartão móvel', async () => {
    await renderResults('cards', null);

    expect(screen.getAllByText(/2451-2\/00/)).toHaveLength(2);
    expect(screen.getByText('Baixada').classList.contains('status-chip--other')).toBe(true);
  });

  it('sem ODS escolhido, não há colunas de índice', async () => {
    await renderResults('table', null);

    expect(screen.getAllByRole('columnheader')).toHaveLength(4);
    expect(screen.queryByText(/Índice no/)).toBeNull();
  });

  it('a tabela fica numa região rolável, alcançável pelo teclado', async () => {
    await renderResults('table', 'ODS 13');

    const region = screen.getByRole('region', { name: 'Empresas encontradas' });
    expect(region.getAttribute('tabindex')).toBe('0');
    expect(within(region).getByRole('table')).toBeTruthy();
  });

  it.each([
    ['asc', 'ascending'],
    ['desc', 'descending'],
  ] as const)(
    'tabela ordenada em %s expõe aria-sort e separa empresas sem índice',
    async (order, ariaSort) => {
      await renderResults('table', 'ODS 13', [SCORED, UNSCORED], order);

      expect(
        screen.getByRole('columnheader', { name: 'Índice no ODS 13' }).getAttribute('aria-sort'),
      ).toBe(ariaSort);
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(4);
      expect(rows[1].textContent).toContain(SCORED.legal_name);
      expect(rows[2].textContent).toContain('Sem índice calculado — apresentados ao fim');
      expect(rows[3].textContent).toContain(UNSCORED.legal_name);
    },
  );

  it('sem ordenação, não anuncia aria-sort nem insere separador', async () => {
    await renderResults('table', 'ODS 13');

    expect(
      screen.getByRole('columnheader', { name: 'Índice no ODS 13' }).hasAttribute('aria-sort'),
    ).toBe(false);
    expect(screen.queryByText('Sem índice calculado — apresentados ao fim')).toBeNull();
  });

  it('cartões: os mesmos dados, com "Sem índice" em vez de zero', async () => {
    await renderResults('cards', 'ODS 13');

    const cards = within(screen.getByRole('list', { name: 'Empresas encontradas' })).getAllByRole(
      'listitem',
    );
    expect(cards).toHaveLength(2);
    expect(
      within(cards[0]).getByRole('heading', { name: 'EMPRESA DEMONSTRACAO S.A.' }),
    ).toBeTruthy();
    expect(cards[0].textContent).toContain('-12,5');
    expect(cards[1].textContent).toContain('Sem índice');
    expect(cards[1].textContent).not.toMatch(/Índice no ODS 13\s*0\b/);
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('cartões ordenados separam as empresas sem índice', async () => {
    await renderResults('cards', 'ODS 13', [SCORED, UNSCORED], 'desc');

    const cards = within(screen.getByRole('list', { name: 'Empresas encontradas' })).getAllByRole(
      'listitem',
    );
    expect(cards).toHaveLength(3);
    expect(cards[0].textContent).toContain(SCORED.legal_name);
    expect(cards[1].textContent).toContain('Sem índice calculado — apresentados ao fim');
    expect(cards[2].textContent).toContain(UNSCORED.legal_name);
  });
});
