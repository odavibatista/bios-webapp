import { render, screen, within } from '@testing-library/angular';
import type { SectorScoreWindow } from '../../../core/api/generated';
import { OMITTED_AVERAGE_NOTE } from '../sector-format';
import { SectorWindowsTable, sectorWindowRows } from './sector-windows-table';

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

  it('agrupa meses omitidos consecutivos com contagens iguais, sem esconder mudanças', () => {
    const december = {
      ...NOVEMBER_OMITTED,
      window_start: '2026-12-01T00:00:00.000Z',
      window_end: '2027-01-01T00:00:00.000Z',
    };
    const january = {
      ...december,
      window_start: '2027-01-01T00:00:00.000Z',
      window_end: '2027-02-01T00:00:00.000Z',
      company_count: 4,
    };

    expect(sectorWindowRows([NOVEMBER_OMITTED, december, january]).map((row) => row.month)).toEqual(
      ['novembro de 2026 a dezembro de 2026', 'janeiro de 2027'],
    );
  });

  it('agrupa pelo que a linha mostra: índice omitido com confiança preenchida, como na API', () => {
    const november = { ...NOVEMBER_OMITTED, average_confidence: 0.00003669455452810803 };
    const december = {
      ...november,
      window_start: '2026-12-01T00:00:00.000Z',
      window_end: '2027-01-01T00:00:00.000Z',
    };
    const january = {
      ...december,
      window_start: '2027-01-01T00:00:00.000Z',
      window_end: '2027-02-01T00:00:00.000Z',
      average_confidence: 0.2,
    };

    expect(
      sectorWindowRows([november, december, january]).map(({ month, score, confidence }) => [
        month,
        score,
        confidence,
      ]),
    ).toEqual([
      ['novembro de 2026 a dezembro de 2026', 'Omitida', '0,00'],
      ['janeiro de 2027', 'Omitida', '0,20'],
    ]);
  });

  it('mês com índice publicado nunca entra no grupo', () => {
    const december = {
      ...OCTOBER,
      window_start: '2026-12-01T00:00:00.000Z',
      window_end: '2027-01-01T00:00:00.000Z',
      average_confidence: NOVEMBER_OMITTED.average_confidence,
      company_count: NOVEMBER_OMITTED.company_count,
      scored_company_count: NOVEMBER_OMITTED.scored_company_count,
    };

    expect(sectorWindowRows([NOVEMBER_OMITTED, december])).toHaveLength(2);
  });
});
