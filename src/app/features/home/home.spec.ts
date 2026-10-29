import { render, screen, within } from '@testing-library/angular';
import { CALCULATED_ODS, Home } from './home';

describe('Home', () => {
  it('apresenta o BIOS num título de primeiro nível', async () => {
    await render(Home);

    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain(
      'evidência por evidência',
    );
  });

  it('lista os ODS calculados, cada um com as suas fontes', async () => {
    await render(Home);

    const list = screen.getByRole('region', { name: 'O que o BIOS calcula' });
    for (const ods of CALCULATED_ODS) {
      expect(within(list).getByText(`ODS ${ods.number}`)).toBeTruthy();
      for (const source of ods.sources) {
        expect(within(list).getByText(source)).toBeTruthy();
      }
    }
  });

  it('explica que índice e confiança ficam lado a lado, nunca combinados', async () => {
    await render(Home);

    const reading = screen.getByRole('region', { name: 'Como ler o índice' });
    expect(within(reading).getByText('Confiança')).toBeTruthy();
    expect(reading.textContent).toContain('nunca combinada com ele');
  });
});
