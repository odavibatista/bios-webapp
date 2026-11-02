import { render, screen, within } from '@testing-library/angular';
import type { SectorScoreWindow } from '../../../core/api/generated';
import { OMITTED_AVERAGE_NOTE } from '../sector-format';
import { SectorWindowsTable } from './sector-windows-table';

const OCTOBER: SectorScoreWindow = {
  window_start: '2026-10-01T00:00:00.000Z',
  window_end: '2026-11-01T00:00:00.000Z',
  average_score: -74.28571428571429,
  average_confidence: 0.4325396825396825,
  company_count: 10,
  scored_company_count: 7,
  rules_version: 'rf10-rf11-v3',
};

const NOVEMBER_OMITTED: SectorScoreWindow = {
  ...OCTOBER,
  window_start: '2026-11-01T00:00:00.000Z',
  window_end: '2026-12-01T00:00:00.000Z',
  average_score: null,
  average_confidence: null,
  company_count: 3,
  scored_company_count: 2,
};

async function renderTable(windows: SectorScoreWindow[]) {
  return render(SectorWindowsTable, {
    inputs: { windows, caption: 'Evolução de METALURGIA no ODS 15' },
  });
}

function cells(row: HTMLElement): string[] {
  return [...row.querySelectorAll('th, td')].map((cell) => cell.textContent.trim());
}

describe('SectorWindowsTable', () => {
  it('uma linha por mês, com índice e confiança em colunas separadas e as contagens', async () => {
    await renderTable([OCTOBER]);

    const table = screen.getByRole('table', { name: 'Evolução de METALURGIA no ODS 15' });
    const [header, row] = within(table).getAllByRole('row');

    expect(cells(header)).toEqual([
      'Mês',
      'Índice médio',
      'Confiança média',
      'Empresas avaliadas',
      'Com índice',
    ]);
    expect(cells(row)).toEqual(['outubro de 2026', '-74,3', '0,43', '10', '7']);
    expect(screen.queryByText(OMITTED_AVERAGE_NOTE)).toBeNull();
  });

  it('mês com média omitida mostra a lacuna, as contagens e a explicação, nunca zero', async () => {
    await renderTable([OCTOBER, NOVEMBER_OMITTED]);

    const rows = within(screen.getByRole('table')).getAllByRole('row');

    expect(cells(rows[2])).toEqual(['novembro de 2026', 'Omitida', 'Omitida', '3', '2']);
    expect(screen.getByText(OMITTED_AVERAGE_NOTE)).toBeTruthy();
  });

  it('a tabela larga rola dentro de uma região focável, nomeada pela legenda', async () => {
    await renderTable([OCTOBER]);

    const region = screen.getByRole('region', { name: 'Evolução de METALURGIA no ODS 15' });

    expect(region.getAttribute('tabindex')).toBe('0');
    expect(within(region).getByRole('table')).toBeTruthy();
  });
});
