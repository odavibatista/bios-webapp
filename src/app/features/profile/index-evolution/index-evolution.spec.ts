import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { BiosApi } from '../../../core/api/bios-api';
import type { CompanyIndexEvolution } from '../../../core/api/generated';
import { IndexEvolution } from './index-evolution';

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

const EVOLUTION: CompanyIndexEvolution = {
  cnpj: '33000167000101',
  reconstructed: true,
  ods: [
    { ods_number: 15, status: 'SHORT_HISTORY', steps: [] },
    { ods_number: 13, status: 'NO_DATED_EVIDENCE', steps: [] },
  ],
};

describe('IndexEvolution', () => {
  const getCompanyIndexEvolution = vi.fn<BiosApi['getCompanyIndexEvolution']>();

  const renderEvolution = () =>
    render(IndexEvolution, {
      inputs: { cnpj: EVOLUTION.cnpj },
      providers: [{ provide: BiosApi, useValue: { getCompanyIndexEvolution } }],
    });

  beforeEach(() => {
    getCompanyIndexEvolution.mockReset();
    vi.stubGlobal('IntersectionObserver', NoopObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('um card por ODS, em ordem, com o aviso de que a série é reconstruída', async () => {
    getCompanyIndexEvolution.mockResolvedValue(EVOLUTION);
    await renderEvolution();

    await screen.findByRole('heading', { name: 'Evolução do índice no ODS 13' });

    const cards = screen.getAllByRole('heading', { level: 3 });

    expect(cards.map((heading) => heading.textContent)).toEqual([
      'Evolução do índice no ODS 13',
      'Evolução do índice no ODS 15',
    ]);
    expect(screen.getByText(/Série reconstruída com as regras atuais/)).toBeTruthy();
    expect(getCompanyIndexEvolution).toHaveBeenCalledWith({ path: { cnpj: EVOLUTION.cnpj } });
  });

  it('sem curva, a mensagem vem com ícone', async () => {
    getCompanyIndexEvolution.mockResolvedValue(EVOLUTION);
    const { container } = await renderEvolution();

    await screen.findByText(/As evidências desta empresa estão em um único ano/);

    expect(container.querySelector('mat-icon')?.textContent).toContain('info');
    expect(container.textContent).toContain('hourglass_top');
  });

  it('falha oferece nova tentativa, sem derrubar o perfil', async () => {
    const user = userEvent.setup();

    getCompanyIndexEvolution.mockRejectedValueOnce(new Error('sem rede'));
    getCompanyIndexEvolution.mockResolvedValue(EVOLUTION);
    await renderEvolution();

    await user.click(await screen.findByRole('button', { name: 'Tentar de novo' }));

    expect(
      await screen.findByText(/As evidências desta empresa estão em um único ano/),
    ).toBeTruthy();
  });
});
