import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { screen, within } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { InMemoryApiCredentials } from '../../../core/api/api-credentials';
import { BiosApi } from '../../../core/api/bios-api';
import type { SectorEvolution as SectorEvolutionResponse } from '../../../core/api/generated';
import { provideMockBiosApi } from '../../../core/mocks/provide-mock-bios-api';
import { OMITTED_AVERAGE_NOTE } from '../sector-format';
import { POPULAR_SECTORS, SectorEvolution } from './sector-evolution';

const RECONSTRUCTED = /os anteriores foram reconstruídos/i;
const INSUFFICIENT = 'Ainda não há janelas suficientes para mostrar a evolução deste setor.';

/** Abre `/setores` com a URL dada, já com sessão no mock, e espia a consulta da evolução. */
async function openSectors(url = '/setores') {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{ path: 'setores', component: SectorEvolution }]),
      provideMockBiosApi({ latencyMs: 0 }),
    ],
  });
  const api = TestBed.inject(BiosApi);
  const session = await api.login({
    body: { email: 'apresentacao@example.com', password: 'Apresentacao2026' },
  });
  TestBed.inject(InMemoryApiCredentials).setAccessToken(session.access_token);
  const evolution = vi.spyOn(api, 'getSectorEvolution');
  const harness = await RouterTestingHarness.create(url);
  const router = TestBed.inject(Router);

  if (url === '/setores') {
    await vi.waitFor(() => expect(router.url).toBe('/setores?cnae=47&ods=15'));
  }

  return { harness, api, evolution, user: userEvent.setup(), router };
}

/** Duas janelas, como a API responderá quando o job tiver gravado o segundo mês. */
const AVAILABLE: SectorEvolutionResponse = {
  cnae_division: '24',
  cnae_division_description: 'METALURGIA',
  ods_number: 13,
  history_status: 'AVAILABLE',
  windows: [
    {
      window_start: '2026-10-01T00:00:00.000Z',
      window_end: '2026-11-01T00:00:00.000Z',
      average_score: 60,
      average_confidence: 0.05,
      company_count: 10,
      scored_company_count: 6,
      rules_version: 'rf10-rf11-v3',
    },
    {
      window_start: '2026-11-01T00:00:00.000Z',
      window_end: '2026-12-01T00:00:00.000Z',
      average_score: 55.25,
      average_confidence: 0.1,
      company_count: 11,
      scored_company_count: 7,
      rules_version: 'rf10-rf11-v3',
    },
  ],
};

describe('SectorEvolution', () => {
  it('sem parâmetros, abre o setor 47 no ODS 15', async () => {
    const { evolution, router } = await openSectors();

    await vi.waitFor(() => {
      expect(router.url).toBe('/setores?cnae=47&ods=15');
      expect(evolution).toHaveBeenCalledWith({ path: { cnae: '47' }, query: { ods: 15 } });
    });
    expect(screen.getByRole('combobox', { name: 'ODS' }).textContent).toContain('ODS 15');
  });

  it('atalhos seguem a quantidade de empresas e aplicam o setor sem ordenar pelo índice', async () => {
    const { user, router } = await openSectors();

    expect(POPULAR_SECTORS.map((sector) => [sector.cnae, sector.companies])).toEqual([
      ['47', 30124],
      ['16', 12603],
      ['46', 9218],
    ]);
    await user.click(
      screen.getByRole('button', { name: /16 — Fabricação de produtos de madeira/ }),
    );
    expect(router.url).toBe('/setores?cnae=16&ods=15');
  });

  it('limpar o setor volta ao estado vazio, preservando o ODS', async () => {
    const { user, router } = await openSectors();

    await user.click(screen.getByRole('button', { name: 'Limpar setor' }));
    expect(router.url).toBe('/setores?ods=15');
    expect(screen.getByText('Escolha um setor e um ODS para ver a evolução.')).toBeTruthy();
  });

  it('voltar a `/setores` pelo menu, com a tela aberta, retoma o setor padrão', async () => {
    const { router } = await openSectors('/setores?cnae=16&ods=15');

    await router.navigateByUrl('/setores');

    await vi.waitFor(() => expect(router.url).toBe('/setores?cnae=47&ods=15'));
  });

  it('o campo de setor sugere os setores de `listSectors`, com código e descrição oficial', async () => {
    const { user } = await openSectors();

    const sector = screen.getByRole('combobox', { name: 'Setor (CNAE)' });
    await user.clear(sector);
    await user.click(sector);
    const options = await screen.findAllByRole('option');

    expect(options.map((option) => option.textContent.trim())).toEqual([
      '24 — METALURGIA',
      '47 — COMÉRCIO VAREJISTA',
      '71 — SERVIÇOS DE ARQUITETURA E ENGENHARIA; TESTES E ANÁLISES TÉCNICAS',
      '85 — EDUCAÇÃO',
    ]);

    await user.type(screen.getByRole('combobox', { name: 'Setor (CNAE)' }), 'educacao');
    await vi.waitFor(() => {
      expect(screen.getAllByRole('option').map((option) => option.textContent.trim())).toEqual([
        '85 — EDUCAÇÃO',
      ]);
    });
  });

  it('consultar leva setor (sem máscara) e ODS para a URL e pede a evolução à API', async () => {
    const { user, router, evolution } = await openSectors();

    await user.clear(screen.getByRole('combobox', { name: 'Setor (CNAE)' }));
    await user.type(screen.getByRole('combobox', { name: 'Setor (CNAE)' }), '24.31-8');
    await user.click(screen.getByRole('combobox', { name: 'ODS' }));
    await user.click(screen.getByRole('option', { name: /ODS 13/ }));
    await user.click(screen.getByRole('button', { name: 'Ver evolução' }));

    await vi.waitFor(() => {
      expect(router.url).toBe('/setores?cnae=24318&ods=13');
    });
    expect(evolution).toHaveBeenCalledWith({ path: { cnae: '24318' }, query: { ods: 13 } });
    expect(await screen.findByRole('heading', { level: 2, name: /24 — METALURGIA/ })).toBeTruthy();
  });

  it('CNAE fora do formato não sai da tela: o erro fica no campo, com a mensagem da API', async () => {
    const { user, router, evolution } = await openSectors();

    await user.clear(screen.getByRole('combobox', { name: 'Setor (CNAE)' }));
    await user.type(screen.getByRole('combobox', { name: 'Setor (CNAE)' }), '2431');
    await user.click(screen.getByRole('button', { name: 'Ver evolução' }));

    expect(
      await screen.findByText(
        'CNAE inválido: informe a divisão (2 dígitos), o grupo, a classe ou a subclasse.',
      ),
    ).toBeTruthy();
    expect(router.url).toBe('/setores?cnae=47&ods=15');
    expect(evolution).not.toHaveBeenCalledWith({ path: { cnae: '2431' }, query: { ods: 15 } });
  });

  it('histórico insuficiente com um mês: diz que ainda não há evolução e mostra o mês registrado', async () => {
    await openSectors('/setores?cnae=24&ods=13');

    // O "Carregando" também é um status: espera o do resultado.
    expect((await screen.findByText(INSUFFICIENT)).closest('[role="status"]')).toBeTruthy();
    expect(screen.getByText(/há um mês registrado/)).toBeTruthy();
    const table = screen.getByRole('table', {
      name: /Mês registrado de 24 — METALURGIA no ODS 13/,
    });
    const [, row] = within(table).getAllByRole('row');

    expect(row?.textContent).toContain('outubro de 2026');
    expect(row?.textContent).toContain('60');
    expect(screen.queryByRole('img', { name: /Gráfico/ })).toBeNull();
  });

  it('histórico insuficiente sem mês: diz que nada foi registrado, sem tabela', async () => {
    await openSectors('/setores?cnae=01&ods=13');

    expect(
      (await screen.findByText(/Nenhum mês foi registrado até agora\./)).closest('[role="status"]'),
    ).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('média omitida aparece como lacuna explicada, com as contagens', async () => {
    await openSectors('/setores?cnae=47&ods=13');

    const table = await screen.findByRole('table');
    const [, row] = within(table).getAllByRole('row');

    expect(row?.textContent).toContain('Omitida');
    expect(screen.getByText(OMITTED_AVERAGE_NOTE)).toBeTruthy();
  });

  it('com duas janelas ou mais, mostra a evolução mês a mês, sem o aviso de histórico insuficiente', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'setores', component: SectorEvolution }]),
        {
          provide: BiosApi,
          useValue: {
            listSectors: () => Promise.resolve({ data: [] }),
            listOds: () =>
              Promise.resolve({
                data: [
                  {
                    ods_number: 13,
                    title: 'Ação contra a mudança global do clima',
                    description: '',
                  },
                ],
              }),
            getSectorEvolution: () => Promise.resolve(AVAILABLE),
          },
        },
      ],
    });
    await RouterTestingHarness.create('/setores?cnae=24&ods=13');

    const table = await screen.findByRole('table', {
      name: /Evolução de 24 — METALURGIA no ODS 13/,
    });
    const rows = within(table).getAllByRole('row').slice(1);

    expect(rows.map((row) => row.querySelector('th')?.textContent.trim())).toEqual([
      'novembro de 2026',
      'outubro de 2026',
    ]);
    expect(screen.queryByText(INSUFFICIENT)).toBeNull();
  });

  it('CNAE recusado pela API (link montado à mão) mostra o erro dela no campo e no resultado', async () => {
    await openSectors('/setores?cnae=abc&ods=13');

    expect((await screen.findByRole('alert')).textContent).toContain(
      'CNAE inválido: informe a divisão (2 dígitos), o grupo, a classe ou a subclasse.',
    );
    await vi.waitFor(() => {
      expect(
        screen.getByRole('combobox', { name: 'Setor (CNAE)' }).getAttribute('aria-invalid'),
      ).toBe('true');
    });
  });

  it('ODS fora dos calculados mostra a mensagem da API com os disponíveis', async () => {
    await openSectors('/setores?cnae=24&ods=7');

    expect(
      await screen.findByText('O ODS 7 não é calculado pelo BIOS. ODS disponíveis: 13, 15.'),
    ).toBeTruthy();
  });

  it('o formulário acompanha a URL (voltar do navegador, link aberto)', async () => {
    const { router } = await openSectors('/setores?cnae=24&ods=13');

    await router.navigateByUrl('/setores?cnae=85&ods=15');

    await vi.waitFor(() => {
      expect(screen.getByRole<HTMLInputElement>('combobox', { name: 'Setor (CNAE)' }).value).toBe(
        '85',
      );
    });
    expect(await screen.findByRole('heading', { level: 2, name: /85 — EDUCAÇÃO/ })).toBeTruthy();
  });

  it('na apresentação, avisa que os meses anteriores foram reconstruídos', async () => {
    const { evolution } = await openSectors();

    evolution.mockResolvedValue(AVAILABLE);
    await TestBed.inject(Router).navigateByUrl('/setores?cnae=24&ods=13');

    expect(await screen.findByText(RECONSTRUCTED)).toBeTruthy();
  });

  it('com um mês só, não fala em reconstrução', async () => {
    await openSectors('/setores?cnae=24&ods=13');

    expect(await screen.findByText(INSUFFICIENT)).toBeTruthy();
    expect(screen.queryByText(RECONSTRUCTED)).toBeNull();
  });
});
