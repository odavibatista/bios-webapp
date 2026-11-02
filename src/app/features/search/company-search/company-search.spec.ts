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
import { CompanySearch, NO_CRITERION_MESSAGE } from './company-search';

/** Abre `/pesquisa` com a URL dada, já com sessão no mock, e espia a pesquisa. */
async function openSearch(url = '/pesquisa', { narrow = false } = {}) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{ path: 'pesquisa', component: CompanySearch }]),
      provideMockBiosApi({ latencyMs: 0 }),
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
  const harness = await RouterTestingHarness.create(url);

  return { harness, search, user: userEvent.setup(), router: TestBed.inject(Router) };
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
  it('sem critério, não pesquisa e explica que é preciso ao menos um', async () => {
    const { search, user, router } = await openSearch();

    expect(screen.getByText('Escolha ao menos um critério e pesquise.')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Pesquisar' }));

    expect((await screen.findByRole('alert')).textContent).toContain(NO_CRITERION_MESSAGE);
    expect(router.url).toBe('/pesquisa');
    expect(search).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Pesquisar' }).getAttribute('aria-describedby')).toBe(
      'dica-criterio',
    );
  });

  it('o seletor de ODS traz só os ODS que o BIOS calcula, e os mínimos dependem dele', async () => {
    const { user } = await openSearch();

    expect(screen.getByLabelText('Índice mínimo').hasAttribute('disabled')).toBe(true);
    expect(screen.getByLabelText('Confiança mínima').hasAttribute('disabled')).toBe(true);

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

  it('com ODS, a lista mostra índice e confiança dele; a página traz o total', async () => {
    await openSearch('/pesquisa?cnae=24&ods=13');

    const rows = await resultRows();
    expect(rows).toHaveLength(10);
    expect(screen.getByRole('status').textContent).toContain('10 empresas encontradas');
    expect(screen.getByRole('columnheader', { name: 'Índice no ODS 13' })).toBeTruthy();
    expect(screen.getByText(/não é nota baixa/)).toBeTruthy();
    expect(screen.getByLabelText<HTMLInputElement>('CNAE').value).toBe('24');
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
    expect(await screen.findByText('Escolha ao menos um critério e pesquise.')).toBeTruthy();
  });

  it('em tela estreita, a lista vira cartões', async () => {
    await openSearch('/pesquisa?uf=MG', { narrow: true });

    const list = await screen.findByRole('list', { name: 'Empresas encontradas' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(4);
    expect(screen.queryByRole('table')).toBeNull();
  });
});
