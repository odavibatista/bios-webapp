import { fireEvent, render, screen } from '@testing-library/angular';
import { TableScroll } from './table-scroll';

const MORE = 'Há mais colunas à direita. Deslize a tabela para vê-las.';
const END = 'Fim da tabela. Deslize de volta para ver o início.';

/** O jsdom não mede layout: a largura da tabela e do enquadramento vêm daqui. */
function measures(region: HTMLElement, sizes: { scrollWidth: number; clientWidth: number }) {
  Object.defineProperty(region, 'scrollWidth', { configurable: true, value: sizes.scrollWidth });
  Object.defineProperty(region, 'clientWidth', { configurable: true, value: sizes.clientWidth });
}

async function renderScroll() {
  await render(
    `<bios-table-scroll label="Tabela das chaves"><table><tr><td>a</td></tr></table></bios-table-scroll>`,
    { imports: [TableScroll] },
  );

  return screen.getByRole('region', { name: 'Tabela das chaves' });
}

describe('TableScroll', () => {
  it('é uma região focável, nomeada, que contém a tabela', async () => {
    const region = await renderScroll();

    expect(region.getAttribute('tabindex')).toBe('0');
    expect(region.querySelector('table')).toBeTruthy();
  });

  it('sem colunas fora do enquadramento, não mostra aviso', async () => {
    const region = await renderScroll();

    measures(region, { scrollWidth: 300, clientWidth: 300 });
    fireEvent.scroll(region);

    expect(screen.queryByText(MORE)).toBeNull();
    expect(screen.queryByText(END)).toBeNull();
  });

  it('avisa que há mais colunas e atualiza o texto ao chegar ao fim', async () => {
    const region = await renderScroll();

    measures(region, { scrollWidth: 621, clientWidth: 358 });
    fireEvent.scroll(region);
    expect(await screen.findByText(MORE)).toBeTruthy();

    region.scrollLeft = 263;
    fireEvent.scroll(region);

    expect(await screen.findByText(END)).toBeTruthy();
    expect(screen.queryByText(MORE)).toBeNull();
  });
});
