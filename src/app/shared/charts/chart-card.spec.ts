import { DeferBlockBehavior } from '@angular/core/testing';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { barChart } from './chart-builders';
import { ChartCard } from './chart-card';
import { foldCategories } from './chart-spec';

const CHART = barChart({
  label: 'Gráfico de empresas por setor. Os mesmos números estão na tabela.',
  items: [
    { key: 'A', label: 'Comércio', value: 12994 },
    { key: 'B', label: 'Indústria', value: 300 },
  ],
  headers: ['Setor', 'Empresas'],
  sentence: ({ label, value }) => `${value} empresas em ${label}`,
});

/** O jsdom não tem `ResizeObserver` nem `IntersectionObserver`, que o card e o ECharts usam. */
class NoopResizeObserver {
  observe(): void {
    // nada a observar no jsdom
  }
  unobserve(): void {
    // idem
  }
  disconnect(): void {
    // idem
  }
}

const renderCard = (inputs: object) =>
  render(ChartCard, {
    inputs: { heading: 'Setor', ...inputs },
    deferBlockBehavior: DeferBlockBehavior.Playthrough,
  });

describe('ChartCard', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', NoopResizeObserver);
    vi.stubGlobal('IntersectionObserver', NoopResizeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('a alternância leva à tabela, com os mesmos números', async () => {
    const user = userEvent.setup();

    await renderCard({ chart: CHART });
    await user.click(screen.getByRole('radio', { name: 'Tabela' }));

    const table = await screen.findByRole('table');

    expect(within(table).getByText('12.994')).toBeTruthy();
    expect(within(table).getByRole('columnheader', { name: 'Setor' })).toBeTruthy();
  });

  it('cada alternância tem nome próprio', async () => {
    await renderCard({ chart: CHART });

    expect(screen.getByRole('radiogroup', { name: 'Ver Setor como' })).toBeTruthy();
  });

  it('sem gráfico, explica por quê, com o ícone pedido e sem alternância', async () => {
    const { container } = await renderCard({
      emptyMessage: 'Só uma evidência.',
      emptyIcon: 'hourglass_top',
    });

    expect(screen.getByText('Só uma evidência.')).toBeTruthy();
    expect(container.querySelector('mat-icon')?.textContent).toContain('hourglass_top');
    expect(screen.queryByRole('radiogroup')).toBeNull();
  });

  it('carregando sem gráfico, mostra o esqueleto com aviso ao leitor de tela', async () => {
    await renderCard({ loading: true });

    expect(screen.getByRole('status').textContent).toContain('Carregando Setor');
  });

  it('carregando com gráfico, segura o anterior em vez de piscar', async () => {
    const { container } = await renderCard({ chart: CHART, loading: true });

    expect(container.querySelector('.stale')).not.toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('a descrição aparece abaixo do título', async () => {
    await renderCard({ chart: CHART, description: 'Empresas na base.' });

    expect(screen.getByText('Empresas na base.')).toBeTruthy();
  });
});

describe('foldCategories', () => {
  it('não mexe em quem cabe no limite', () => {
    const items = [{ key: 'A', label: 'A', value: 1 }];

    expect(foldCategories(items, 2)).toEqual(items);
  });
});
