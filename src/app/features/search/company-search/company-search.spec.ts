import { BreakpointObserver } from '@angular/cdk/layout';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { screen, within } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { of } from 'rxjs';
import { InMemoryApiCredentials } from '../../../core/api/api-credentials';
import { BiosApi } from '../../../core/api/bios-api';
import { provideMockBiosApi } from '../../../core/mocks/provide-mock-bios-api';
import type { MockApiConfig } from '../../../core/mocks/mock-config';
import { MockFiles } from '../../../core/mocks/mock-files';
import { CompanySearch, NO_CRITERION_MESSAGE } from './company-search';

/** O jsdom não tem `IntersectionObserver`, que os cards do panorama usam. */
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

/** Abre `/pesquisa` com a URL dada, já com sessão no mock, e espia a pesquisa. */
async function openSearch(
  url = '/pesquisa',
  {
    narrow = false,
    config = {},
    beforeOpen,
  }: {
    narrow?: boolean;
    config?: Partial<MockApiConfig>;
    beforeOpen?: (api: BiosApi) => void;
  } = {},
) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{ path: 'pesquisa', component: CompanySearch }]),
      provideMockBiosApi({ latencyMs: 0, ...config }),
      {
        provide: BreakpointObserver,
        useValue: { observe: () => of({ matches: narrow, breakpoints: {} }) },
      },
    ],
  });
  const api = TestBed.inject(BiosApi);
  const session = await api.login({
    body: { email: 'apresentacao@example.com', password: 'Apresentacao2026' },
  });
  TestBed.inject(InMemoryApiCredentials).setAccessToken(session.access_token);
  const search = vi.spyOn(api, 'searchCompanies');
  const exportFile = vi.spyOn(api, 'exportCompaniesXlsx');
  beforeOpen?.(api);
  const harness = await RouterTestingHarness.create(url);

  return { harness, search, exportFile, user: userEvent.setup(), router: TestBed.inject(Router) };
}

/** A pesquisa responde, e o panorama falha uma vez. */
async function openFailingOverview() {
  const opened = await openSearch('/pesquisa?nome=SIDERMIN&visao=panorama', {
    beforeOpen: (api) => {
      vi.spyOn(api, 'getCompanyAnalytics').mockRejectedValueOnce(new Error('sem rede'));
    },
  });

  return opened;
}

async function resultRows() {
  const table = await screen.findByRole('table');

  return within(table).getAllByRole('row').slice(1);
}

/** Espera a tabela com `count` empresas (a da pesquisa anterior pode ainda estar na tela). */
async function expectRows(count: number) {
  await vi.waitFor(async () => {
    expect(await resultRows()).toHaveLength(count);
  });
}

describe('CompanySearch', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', NoopObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('a dica some ao preencher um critério, e o botão deixa de citá-la', async () => {
    const { user } = await openSearch();
    const button = screen.getByRole('button', { name: 'Pesquisar' });

    expect(button.getAttribute('aria-describedby')).toBe('dica-criterio');

    await user.type(screen.getByLabelText('Nome da empresa'), 'aço');

    expect(screen.queryByText('Informe ao menos um critério.')).toBeNull();
    expect(button.getAttribute('aria-describedby')).toBeNull();
  });

  it('sem critério, não pesquisa e explica que é preciso ao menos um', async () => {
    const { search, user, router } = await openSearch();

    await user.click(screen.getByRole('button', { name: 'Pesquisar' }));

    expect((await screen.findByRole('alert')).textContent).toContain(NO_CRITERION_MESSAGE);
    expect(router.url).toBe('/pesquisa');
    expect(search).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Exportar XLSX' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Pesquisar' }).getAttribute('aria-describedby')).toBe(
      'dica-criterio',
    );
  });

  it('o seletor de ODS traz só os ODS que o BIOS calcula, e os mínimos dependem dele', async () => {
    const { user } = await openSearch();

    expect(screen.getByLabelText('Índice mínimo').hasAttribute('disabled')).toBe(true);
    expect(screen.getByLabelText('Confiança mínima').hasAttribute('disabled')).toBe(true);
    expect(
      screen.getByRole('combobox', { name: 'Ordenar pelo índice' }).getAttribute('aria-disabled'),
    ).toBe('true');
    expect(screen.getByText('Escolha um ODS para ordenar')).toBeTruthy();

    await user.click(screen.getByRole('combobox', { name: 'ODS' }));
    const options = (await screen.findAllByRole('option')).map((option) =>
      option.textContent.trim(),
    );
    expect(options).toEqual([
      'Nenhum',
      expect.stringMatching(/^ODS 13 — /),
      expect.stringMatching(/^ODS 15 — /),
    ]);

    await user.click(screen.getByRole('option', { name: /^ODS 15 — / }));

    expect(screen.getByLabelText('Índice mínimo').hasAttribute('disabled')).toBe(false);
    expect(screen.getByLabelText('Confiança mínima').hasAttribute('disabled')).toBe(false);
    expect(
      screen.getByRole('combobox', { name: 'Ordenar pelo índice' }).getAttribute('aria-disabled'),
    ).toBe('false');
  });

  it('ordena pelo índice nos dois sentidos, reflete a URL e limpa a ordem sem ODS', async () => {
    const { search, user, router } = await openSearch('/pesquisa?cnae=24&ods=13');
    await resultRows();

    const order = screen.getByRole('combobox', { name: 'Ordenar pelo índice' });
    await user.click(order);
    await user.click(screen.getByRole('option', { name: 'Maior índice primeiro' }));
    await user.click(screen.getByRole('button', { name: 'Pesquisar' }));

    await vi.waitFor(() => expect(router.url).toBe('/pesquisa?cnae=24&ods=13&ordem=desc'));
    expect(search).toHaveBeenLastCalledWith({
      query: { page: 1, page_size: 20, cnae: '24', ods: 13, order: 'desc' },
    });
    expect(
      (await screen.findByRole('columnheader', { name: 'Índice no ODS 13' })).getAttribute(
        'aria-sort',
      ),
    ).toBe('descending');

    await user.click(order);
    await user.click(screen.getByRole('option', { name: 'Menor índice primeiro' }));
    await user.click(screen.getByRole('button', { name: 'Pesquisar' }));

    await vi.waitFor(() => expect(router.url).toBe('/pesquisa?cnae=24&ods=13&ordem=asc'));
    expect(search).toHaveBeenLastCalledWith({
      query: { page: 1, page_size: 20, cnae: '24', ods: 13, order: 'asc' },
    });
    expect(
      (await screen.findByRole('columnheader', { name: 'Índice no ODS 13' })).getAttribute(
        'aria-sort',
      ),
    ).toBe('ascending');

    await router.navigateByUrl('/pesquisa?cnae=24&ods=13&ordem=desc');
    await vi.waitFor(() => expect(order.textContent).toContain('Maior índice primeiro'));

    await user.click(screen.getByRole('combobox', { name: 'ODS' }));
    await user.click(screen.getByRole('option', { name: 'Nenhum' }));
    expect(order.getAttribute('aria-disabled')).toBe('true');
    await user.click(screen.getByRole('button', { name: 'Pesquisar' }));
    await vi.waitFor(() => expect(router.url).toBe('/pesquisa?cnae=24'));
  });

  it('pesquisar leva os critérios à URL e envia à API só o que foi informado', async () => {
    const { search, user, router } = await openSearch();

    await user.type(screen.getByLabelText('CNAE'), '24.51');
    await user.click(screen.getByRole('combobox', { name: 'ODS' }));
    await user.click(await screen.findByRole('option', { name: /^ODS 13 — / }));
    await user.type(screen.getByLabelText('Índice mínimo'), '-50');
    await user.type(screen.getByLabelText('Confiança mínima'), '0,1');
    await user.click(screen.getByRole('button', { name: 'Pesquisar' }));

    await vi.waitFor(() => {
      expect(router.url).toBe('/pesquisa?cnae=2451&ods=13&indice_min=-50&confianca_min=0.1');
    });
    expect(search).toHaveBeenLastCalledWith({
      query: {
        page: 1,
        page_size: 20,
        cnae: '2451',
        ods: 13,
        min_score: -50,
        min_confidence: 0.1,
      },
    });
  });

  it('no celular, pesquisar leva o foco e a rolagem até os resultados', async () => {
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    const { user } = await openSearch('/pesquisa', { narrow: true });

    await user.type(screen.getByRole('textbox', { name: 'CNAE' }), '24');
    await user.click(screen.getByRole('button', { name: 'Pesquisar' }));

    await vi.waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Resultados' }));
    });
    expect(scroll).toHaveBeenCalledWith({ block: 'start' });
  });

  it('no desktop, pesquisar não move a tela', async () => {
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    const { user } = await openSearch('/pesquisa');

    await user.type(screen.getByRole('textbox', { name: 'CNAE' }), '24');
    await user.click(screen.getByRole('button', { name: 'Pesquisar' }));
    await expectRows(10);

    expect(scroll).not.toHaveBeenCalled();
  });

  it('no celular, a paginação aparece também acima dos cartões', async () => {
    await openSearch('/pesquisa?cnae=24&por_pagina=5', { narrow: true });

    const top = await screen.findByRole('navigation', { name: 'Navegação rápida entre páginas' });
    const bottom = screen.getByRole('navigation', { name: 'Páginas dos resultados' });

    expect(within(top).getByRole('button', { name: 'Próxima página' })).toBeTruthy();
    expect(within(bottom).getByRole('button', { name: 'Próxima página' })).toBeTruthy();
    expect(within(top).queryByLabelText('Itens por página')).toBeNull();
  });

  it('no desktop, a paginação fica só depois da tabela', async () => {
    await openSearch('/pesquisa?cnae=24&por_pagina=5');

    await screen.findByRole('navigation', { name: 'Páginas dos resultados' });

    expect(screen.queryByRole('navigation', { name: 'Navegação rápida entre páginas' })).toBeNull();
  });

  it('com ODS, a lista mostra índice e confiança dele; a página traz o total', async () => {
    await openSearch('/pesquisa?cnae=24&ods=13');

    const rows = await resultRows();
    expect(rows).toHaveLength(10);
    expect(screen.getByRole('status').textContent).toContain('10 empresas encontradas');
    expect(screen.getByRole('columnheader', { name: 'Índice no ODS 13' })).toBeTruthy();
    expect(screen.getByText(/não é nota baixa/)).toBeTruthy();
    expect(screen.getByLabelText<HTMLInputElement>('CNAE').value).toBe('24');
  });

  it('sem ODS, orienta como ver índice e confiança na lista', async () => {
    await openSearch('/pesquisa?cnae=24');

    expect(await resultRows()).toHaveLength(10);
    expect(screen.getByText('Escolha um ODS para ver o índice e a confiança.')).toBeTruthy();
  });

  it('pagina pela URL: próxima página e voltar, com o tamanho escolhido', async () => {
    const { search, user, router } = await openSearch('/pesquisa?cnae=24&por_pagina=5');

    expect(await resultRows()).toHaveLength(5);
    expect(screen.getByText('Página 1 de 2')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Página anterior' }).hasAttribute('disabled')).toBe(
      true,
    );

    await user.click(screen.getByRole('button', { name: 'Próxima página' }));

    await vi.waitFor(() => {
      expect(router.url).toBe('/pesquisa?cnae=24&pagina=2&por_pagina=5');
    });
    expect(await screen.findByText('Página 2 de 2')).toBeTruthy();
    expect(search).toHaveBeenLastCalledWith({ query: { page: 2, page_size: 5, cnae: '24' } });
    expect(screen.getByRole('button', { name: 'Próxima página' }).hasAttribute('disabled')).toBe(
      true,
    );
  });

  it('mudar o tamanho da página volta à primeira', async () => {
    const { user, router } = await openSearch('/pesquisa?cnae=24&pagina=2&por_pagina=5');

    await screen.findByText('Página 2 de 2');
    await user.selectOptions(screen.getByLabelText('Itens por página'), '50');

    await vi.waitFor(() => {
      expect(router.url).toBe('/pesquisa?cnae=24&por_pagina=50');
    });
  });

  it('ODS fora dos calculados mostra os disponíveis, e escolher um refaz a pesquisa', async () => {
    const { user, router } = await openSearch('/pesquisa?cnae=24&ods=7');

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('O ODS 7 não é calculado pelo BIOS.');
    await user.click(within(alert).getByRole('button', { name: /^ODS 15 — / }));

    await vi.waitFor(() => {
      expect(router.url).toBe('/pesquisa?cnae=24&ods=15');
    });
  });

  it('nenhum resultado sugere afrouxar os filtros', async () => {
    await openSearch('/pesquisa?nome=empresa%20inexistente%20demonstracao');

    expect(
      await screen.findByText(
        'Nenhuma empresa atende aos filtros. Tente afrouxá-los: retire um critério ou diminua os mínimos.',
      ),
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Exportar XLSX' })).toBeNull();
  });

  it('exporta a lista inteira com filtros e ordem da URL, usando o nome da API', async () => {
    const { user, exportFile } = await openSearch(
      '/pesquisa?cnae=24&ods=13&ordem=desc&pagina=2&por_pagina=5',
    );
    const load = vi.spyOn(TestBed.inject(MockFiles), 'load').mockResolvedValue(new Blob(['xlsx']));
    const createUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:teste');
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      expect(this.download).toBe('empresas-bios-2026-10-30.xlsx');
    });

    await expectRows(6);
    await user.click(screen.getByRole('button', { name: 'Exportar XLSX' }));

    await vi.waitFor(() =>
      expect(exportFile).toHaveBeenCalledWith({
        query: { cnae: '24', ods: 13, order: 'desc' },
      }),
    );
    await vi.waitFor(() => expect(click).toHaveBeenCalledOnce());
    expect(load).toHaveBeenCalledWith(
      'exportCompaniesXlsx',
      'setor-ods-13-desc.xlsx',
      expect.any(String),
    );
    expect(createUrl).toHaveBeenCalledWith(expect.any(Blob));
    expect(screen.getByRole('button', { name: 'Exportar XLSX' }).hasAttribute('disabled')).toBe(
      false,
    );
    click.mockRestore();
    createUrl.mockRestore();
  });

  it('teto excedido informa o total e pede para refinar os critérios', async () => {
    const { user } = await openSearch('/pesquisa?cnae=24', { config: { exportMaxCompanies: 3 } });
    await expectRows(10);
    await user.click(screen.getByRole('button', { name: 'Exportar XLSX' }));

    expect((await screen.findByRole('alert')).textContent).toContain('10 empresas');
    expect(screen.getByRole('alert').textContent).toContain('até 3');
    expect(screen.getByRole('alert').textContent).toContain('Refine os critérios');
  });

  it('durante a exportação mostra progresso e bloqueia outro clique', async () => {
    const { user, exportFile } = await openSearch('/pesquisa?cnae=24');
    await expectRows(10);
    let rejectExport!: (error: unknown) => void;
    exportFile.mockImplementation(
      () =>
        new Promise<Awaited<ReturnType<BiosApi['exportCompaniesXlsx']>>>((_resolve, reject) => {
          rejectExport = reject;
        }),
    );

    await user.click(screen.getByRole('button', { name: 'Exportar XLSX' }));
    const button = screen.getByRole('button', { name: 'Exportando XLSX…' });
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(exportFile).toHaveBeenCalledTimes(1);

    rejectExport(new Error('falha de teste'));
    await screen.findByRole('alert');
    expect(screen.getByRole('button', { name: 'Exportar XLSX' }).hasAttribute('disabled')).toBe(
      false,
    );
  });

  it('404 da exportação informa que não há lista para baixar', async () => {
    const { user } = await openSearch('/pesquisa?cnae=24', {
      config: { forcedErrors: { exportCompaniesXlsx: 'exportCompaniesXlsx/sem-resultado' } },
    });
    await expectRows(10);
    await user.click(screen.getByRole('button', { name: 'Exportar XLSX' }));
    expect((await screen.findByRole('alert')).textContent).toContain('Nenhuma empresa');
  });

  it('429 da exportação informa quando poderá tentar de novo', async () => {
    const { user } = await openSearch('/pesquisa?cnae=24', {
      config: { forcedErrors: { exportCompaniesXlsx: 'exportCompaniesXlsx/limite-excedido' } },
    });
    await expectRows(10);
    await user.click(screen.getByRole('button', { name: 'Exportar XLSX' }));

    expect((await screen.findByRole('alert')).textContent).toContain(
      'Você poderá tentar de novo em 1 min',
    );
    expect(screen.getByRole('button', { name: 'Tentar de novo' }).hasAttribute('disabled')).toBe(
      true,
    );
  });

  it('critério fora da regra não sai da tela e marca o campo', async () => {
    const { search, user, router } = await openSearch();

    await user.type(screen.getByLabelText('Nome da empresa'), 'ab');
    await user.click(screen.getByRole('button', { name: 'Pesquisar' }));

    expect(
      await screen.findByText('Informe ao menos uma palavra com 3 letras ou mais.'),
    ).toBeTruthy();
    expect(screen.getByLabelText('Nome da empresa').getAttribute('aria-invalid')).toBe('true');
    expect(router.url).toBe('/pesquisa');
    expect(search).not.toHaveBeenCalled();
  });

  it('erro de validação vindo da URL mostra a mensagem da API', async () => {
    await openSearch('/pesquisa?nome=ab');

    expect(
      await screen.findByText('Informe ao menos uma palavra com 3 letras ou mais.'),
    ).toBeTruthy();
  });

  // O "voltar" do navegador é uma navegação para a URL anterior; o botão de verdade está no e2e.
  it('a lista e o formulário acompanham a URL a cada navegação', async () => {
    const { router } = await openSearch('/pesquisa?uf=MG');
    await expectRows(4);

    await router.navigateByUrl('/pesquisa?cnae=24');
    await expectRows(10);
    expect(screen.getByLabelText<HTMLInputElement>('CNAE').value).toBe('24');

    await router.navigateByUrl('/pesquisa?uf=MG');
    await expectRows(4);
    expect(screen.getByLabelText<HTMLInputElement>('CNAE').value).toBe('');
  });

  it('limpar tira os critérios da URL', async () => {
    const { user, router } = await openSearch('/pesquisa?uf=MG');

    await resultRows();
    await user.click(screen.getByRole('button', { name: 'Limpar' }));

    await vi.waitFor(() => {
      expect(router.url).toBe('/pesquisa');
    });
    expect(await screen.findByRole('heading', { name: 'Panorama' })).toBeTruthy();
  });

  it('sem critério, abre o panorama da base; a outra aba explica o que falta', async () => {
    await openSearch();

    expect(await screen.findByRole('heading', { name: 'Situação cadastral' })).toBeTruthy();
    expect(await screen.findByText('Empresas na base')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Resultados' })).toBeNull();
  });

  it('a aba de resultados, escolhida na URL, explica que falta um critério', async () => {
    await openSearch('/pesquisa?visao=resultados');

    expect(await screen.findByText('Escolha ao menos um critério e pesquise.')).toBeTruthy();
  });

  it('com critério, abre a lista, e os totais já são os do recorte', async () => {
    const { harness } = await openSearch('/pesquisa?nome=SIDERMIN');

    await expectRows(1);
    await harness.fixture.whenStable();

    const companies = await screen.findByText('Empresas na base');

    await vi.waitFor(() => {
      expect(companies.nextElementSibling?.textContent).toBe('1');
    });
  });

  it('pesquisar pelo panorama mantém a aba e a escolha na URL', async () => {
    const { user, router } = await openSearch('/pesquisa?visao=panorama');

    await user.type(screen.getByLabelText('Nome da empresa'), 'SIDERMIN');
    await user.click(screen.getByRole('button', { name: 'Pesquisar' }));

    await vi.waitFor(() => {
      expect(router.url).toBe('/pesquisa?nome=SIDERMIN&visao=panorama');
    });
    expect(await screen.findByRole('heading', { name: 'Panorama' })).toBeTruthy();
  });

  it('trocar de aba ou de página não refaz o panorama', async () => {
    const analytics = vi.fn();
    const { user, search } = await openSearch('/pesquisa?uf=MG', {
      beforeOpen: (api) => {
        analytics.mockImplementation(api.getCompanyAnalytics.bind(api));
        api.getCompanyAnalytics = analytics;
      },
    });

    await expectRows(4);
    const searches = search.mock.calls.length;

    await user.click(screen.getByRole('tab', { name: 'Panorama' }));
    await screen.findByRole('heading', { name: 'Panorama' });

    expect(analytics).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledTimes(searches);
  });

  it('falha no panorama não derruba a lista e oferece nova tentativa', async () => {
    const { user } = await openFailingOverview();

    expect(await screen.findByRole('button', { name: 'Tentar de novo' })).toBeTruthy();
    await user.click(screen.getByRole('tab', { name: 'Resultados' }));
    await expectRows(1);
  });

  it('em tela estreita, a lista vira cartões', async () => {
    await openSearch('/pesquisa?uf=MG', { narrow: true });

    const list = await screen.findByRole('list', { name: 'Empresas encontradas' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(4);
    expect(screen.queryByRole('table')).toBeNull();
  });
});
