import { render, screen, within } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import type { CompanyFullProfileResponse } from '../../../core/api/generated';
import acoCearense from '../../../core/mocks/fixtures/getCompanyProfile/aco-cearense';
import atuante from '../../../core/mocks/fixtures/getCompanyProfile/atuante';
import { EnvironmentalEvidences } from './environmental-evidences';

const ACO = acoCearense.body as CompanyFullProfileResponse;
const ATUANTE = atuante.body as CompanyFullProfileResponse;

describe('EnvironmentalEvidences', () => {
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
    ).toContain('isso não confirma ausência de registro');
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

    expect(screen.getByRole('region', { name: 'Conduta administrativa' }).textContent).toContain(
      'CGU — CEIS: Atualização em andamento',
    );
    expect(screen.getByRole('region', { name: 'Conduta administrativa' }).textContent).toContain(
      'Recarregue o perfil em cerca de 2 minutos',
    );
    expect(
      screen.getByRole('region', { name: 'Inventários de emissões de GEE' }).textContent,
    ).toContain('Fonte indisponível nesta consulta');
    expect(screen.getByRole('link', { name: 'Consultar na fonte: 343440-D' })).toBeTruthy();
  });

  it('categoria sem evidências explica que isso não prova ausência', async () => {
    const profile = structuredClone(ACO);
    profile.evidences[2].evidences = [];
    await render(EnvironmentalEvidences, { inputs: { profile } });
    expect(
      screen.getByRole('region', { name: 'Inventários de emissões de GEE' }).textContent,
    ).toContain('Isso não confirma ausência de registros');
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
