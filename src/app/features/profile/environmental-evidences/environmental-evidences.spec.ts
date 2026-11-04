import { render, screen, within } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import type { CompanyFullProfileResponse } from '../../../core/api/generated';
import acoCearense from '../../../core/mocks/fixtures/getCompanyProfile/aco-cearense';
import atuante from '../../../core/mocks/fixtures/getCompanyProfile/atuante';
import { EnvironmentalEvidences } from './environmental-evidences';

const ACO = acoCearense.body as CompanyFullProfileResponse;
const ATUANTE = atuante.body as CompanyFullProfileResponse;

describe('EnvironmentalEvidences', () => {
  it('mantém os estados das evidências sem classe visual de valor', async () => {
    const result = await render(EnvironmentalEvidences, { inputs: { profile: ACO } });
    const states = [...result.container.querySelectorAll('.evidence .state')];

    expect(states.some((state) => state.textContent?.includes('Registro encontrado'))).toBe(true);
    expect(states.some((state) => state.textContent?.includes('Sem registro na fonte'))).toBe(true);
    expect(states.every((state) => state.className === 'state')).toBe(true);
  });

  it('separa as três categorias e mostra fonte, estado, datas e referência auditável', async () => {
    await render(EnvironmentalEvidences, { inputs: { profile: ACO } });

    expect(screen.getByRole('region', { name: 'Evidências' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Infrações ambientais' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Conduta administrativa' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Inventários de emissões de GEE' })).toBeTruthy();
    const infraction = screen.getByRole('region', { name: 'Infrações ambientais' });
    const link = within(infraction).getByRole('link', { name: 'Consultar na fonte: 343440-D' });
    expect(link.getAttribute('href')).toMatch(/^https:\/\/dadosabertos\.ibama\.gov\.br/);
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
    expect(infraction.textContent).toContain('Publicação');
    expect(infraction.textContent).toContain('12/09/2008');
    expect(infraction.textContent).toContain('Coleta');
    expect(infraction.textContent).toContain('Validade da coleta');
  });

  it('não apresenta UNKNOWN como ausência confirmada nem mistura sanção com infração', async () => {
    await render(EnvironmentalEvidences, { inputs: { profile: ATUANTE } });
    const administrative = screen.getByRole('region', { name: 'Conduta administrativa' });
    const infraction = screen.getByRole('region', { name: 'Infrações ambientais' });
    expect(administrative.textContent).toContain('Sanção administrativa registrada no CEIS');
    expect(administrative.textContent).toContain('Período informado pela fonte');
    expect(administrative.textContent).toContain('Confira a situação atual');
    expect(infraction.textContent).not.toContain('Sanção administrativa');
    expect(infraction.textContent).toContain('Sem registro na fonte');
    expect(
      screen.getByRole('region', { name: 'Inventários de emissões de GEE' }).textContent,
    ).toContain('Isso não confirma ausência de inventário');
  });

  it('sem URL segura conserva o identificador como texto', async () => {
    const profile = structuredClone(ACO);
    const first = profile.evidences[0].evidences[0];
    first.source_url = 'http://dados.gov.br/registro';
    await render(EnvironmentalEvidences, { inputs: { profile } });
    expect(screen.getByText('343440-D')).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Consultar na fonte: 343440-D' })).toBeNull();
  });

  it('sem identificador nem URL segura omite os detalhes confirmatórios', async () => {
    const profile = structuredClone(ACO);
    const first = profile.evidences[0].evidences[0];
    first.source_url = 'http://dados.gov.br/registro';
    first.source_reference = null;
    const result = await render(EnvironmentalEvidences, { inputs: { profile } });
    const firstCard = result.container.querySelector('.evidence');
    expect(firstCard?.textContent).toContain('Não foi possível verificar');
    expect(firstCard?.textContent).not.toContain('Multa simples');
  });

  it('mostra origem pendente, indisponibilidade e prazo para atualizar, sem esconder outras fontes', async () => {
    const profile = structuredClone(ACO);
    profile.provenance.sources[1].origin = 'PENDING';
    profile.provenance.sources[3].origin = 'UNAVAILABLE';
    profile.provenance.retry_after_seconds = 120;
    await render(EnvironmentalEvidences, { inputs: { profile } });

    const sources = screen.getByRole('region', { name: 'Fontes consultadas' }).textContent;
    expect(sources).toContain('CGU — CEIS: Consulta em andamento');
    expect(sources).toContain(
      'GHG Protocol — Registro Público de Emissões: Não há inventário localizado',
    );
    expect(sources).toContain('Consultada em');
    expect(sources).not.toContain('Dados armazenados');
    expect(sources).toContain('Recarregue o perfil em cerca de 2 minutos');
    expect(screen.getByRole('link', { name: 'Consultar na fonte: 343440-D' })).toBeTruthy();
  });

  it('explica a cobertura voluntária do GHG no card e na lista de fontes', async () => {
    await render(EnvironmentalEvidences, { inputs: { profile: ACO } });

    const ghg = screen.getByRole('region', { name: 'Inventários de emissões de GEE' }).textContent;
    const sources = screen.getByRole('region', { name: 'Fontes consultadas' }).textContent;
    expect(ghg).toContain('Inventário não localizado no registro voluntário');
    expect(ghg).toContain('Isso não confirma ausência de inventário');
    expect(ghg).not.toContain('Não foi possível verificar');
    expect(sources).toContain(
      'Não há inventário localizado para esta empresa no registro voluntário',
    );
    expect(sources).not.toContain('GHG Protocol — Registro Público de Emissões: Indisponível');
  });

  it('explica o GHG mesmo quando a categoria não traz um card', async () => {
    const profile = structuredClone(ACO);
    profile.evidences[2].evidences = [];
    await render(EnvironmentalEvidences, { inputs: { profile } });

    const ghg = screen.getByRole('region', { name: 'Inventários de emissões de GEE' }).textContent;
    expect(ghg).toContain('Não há inventário localizado para esta empresa no registro voluntário');
    expect(ghg).toContain('Isso não confirma ausência de inventário');
  });

  it('distingue fonte consultada sem registro de fonte pendente ou indisponível', async () => {
    const profile = structuredClone(ACO);
    for (const group of profile.evidences) group.evidences = [];
    profile.provenance.sources[0].evidence_state = 'NOT_FOUND';
    profile.provenance.sources[1].origin = 'PENDING';
    profile.provenance.sources[2].origin = 'UNAVAILABLE';
    profile.provenance.sources[3].origin = 'PERSISTED';
    profile.provenance.sources[3].evidence_state = 'UNKNOWN';
    profile.provenance.retry_after_seconds = 120;
    await render(EnvironmentalEvidences, { inputs: { profile } });

    const ibama = screen.getByRole('region', { name: 'Infrações ambientais' }).textContent;
    const cgu = screen.getByRole('region', { name: 'Conduta administrativa' }).textContent;
    const ghg = screen.getByRole('region', { name: 'Inventários de emissões de GEE' }).textContent;
    expect(ibama).toContain('Consultada, sem registro para esta empresa');
    expect(cgu).toContain('CGU — CEIS: Consulta em andamento');
    expect(cgu).toContain('CGU — CNEP: Indisponível no momento');
    expect(cgu).toContain('Recarregue o perfil em cerca de 2 minutos');
    expect(ghg).toContain('Não foi possível verificar esta fonte');
    expect(ghg).not.toContain('sem registro para esta empresa');
  });

  it('fonte com consulta vencida não vira ausência confirmada', async () => {
    const profile = structuredClone(ACO);
    profile.evidences[0].evidences = [];
    profile.provenance.sources[0].evidence_state = 'OUTDATED';
    await render(EnvironmentalEvidences, { inputs: { profile } });
    expect(screen.getByRole('region', { name: 'Infrações ambientais' }).textContent).toContain(
      'Consulta anterior vencida; a situação atual não foi confirmada',
    );
  });

  it('registro desatualizado recomenda conferir a fonte sem tratá-lo como dado atual', async () => {
    const profile = structuredClone(ACO);
    profile.evidences[0].evidences[0].state = 'OUTDATED';
    await render(EnvironmentalEvidences, { inputs: { profile } });
    expect(screen.getByText('Dados desatualizados')).toBeTruthy();
    expect(screen.getByText(/Os dados venceram desde a coleta/)).toBeTruthy();
  });

  it('o botão de atualização emite o pedido ao perfil', async () => {
    const user = userEvent.setup();
    const refreshed = vi.fn();
    const result = await render(EnvironmentalEvidences, { inputs: { profile: ACO } });
    result.fixture.componentInstance.refresh.subscribe(refreshed);
    await user.click(screen.getByRole('button', { name: 'Atualizar perfil' }));
    expect(refreshed).toHaveBeenCalledOnce();
  });
});
