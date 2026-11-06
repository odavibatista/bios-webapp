import { render, screen } from '@testing-library/angular';
import { provideMockBiosApi } from '../../../core/mocks/provide-mock-bios-api';
import { capturedAnalytics } from '../../../core/mocks/mock-companies';
import { DataOverview } from './data-overview';

/** O jsdom não tem `IntersectionObserver`, que o card usa para carregar ao aparecer. */
class NoopObserver {
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

describe('DataOverview', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', NoopObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const renderOverview = (inputs: object) =>
    render(DataOverview, { inputs, providers: [provideMockBiosApi({ latencyMs: 0 })] });

  it('mostra um card por gráfico', async () => {
    await renderOverview({ analytics: capturedAnalytics(undefined) });

    expect(screen.getByRole('heading', { name: 'Situação cadastral' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Índice no ODS 15' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Confiança no ODS 15' })).toBeTruthy();
  });

  it('sem dados, os cards ficam em esqueleto', async () => {
    await renderOverview({ analytics: null });

    expect(screen.getAllByRole('status').length).toBeGreaterThan(1);
  });

  it('nenhum card nomeia empresas', async () => {
    const analytics = capturedAnalytics(undefined);
    const { container } = await renderOverview({ analytics });

    expect(container.textContent).not.toContain('ARCELORMITTAL');
  });
});
