import { render, screen, within } from '@testing-library/angular';
import type { CompanyFullProfileResponse } from '../../../core/api/generated';
import acoCearense from '../../../core/mocks/fixtures/getCompanyProfile/aco-cearense';
import { RegistrationData } from './registration-data';

const PROFILE = acoCearense.body as CompanyFullProfileResponse;

/** O valor (`dd`) do termo (`dt`) com este texto. */
function valueOf(term: string): HTMLElement {
  const dt = screen.getByText(term, { selector: 'dt' });
  const dd = dt.nextElementSibling;

  if (!(dd instanceof HTMLElement)) throw new Error(`sem valor para "${term}"`);
  return dd;
}

async function renderData(profile: Partial<CompanyFullProfileResponse> = {}) {
  return render(RegistrationData, { inputs: { profile: { ...PROFILE, ...profile } } });
}

describe('RegistrationData', () => {
  it('mostra situação, porte, endereço e a data em que a fonte atualizou o cadastro', async () => {
    await renderData();

    expect(screen.getByRole('region', { name: 'Dados cadastrais' })).toBeTruthy();
    expect(valueOf('Situação cadastral').textContent.trim()).toBe('Ativa');
    expect(valueOf('Porte').textContent.trim()).toBe(
      'Demais (nem microempresa nem de pequeno porte)',
    );
    expect(valueOf('Endereço').textContent).toContain(
      `${PROFILE.address.city}/${PROFILE.address.uf}`,
    );
    expect(screen.getByText(/Cadastro atualizado na fonte em/).textContent).toContain(
      '30/10/2026, 10:36',
    );
  });

  it('cada CNAE aparece com o código formatado e a descrição (RF06)', async () => {
    await renderData();

    expect(valueOf('Atividade principal (CNAE)').textContent.replace(/\s+/g, ' ').trim()).toBe(
      '2431-8/00 PRODUÇÃO DE TUBOS DE AÇO COM COSTURA',
    );
    const secondary = within(valueOf('Atividades secundárias')).getAllByRole('listitem');
    expect(secondary).toHaveLength(PROFILE.secondary_cnaes.length);
    expect(secondary[0]?.textContent.replace(/\s+/g, ' ').trim()).toBe(
      '2439-3/00 PRODUÇÃO DE OUTROS TUBOS DE FERRO E AÇO',
    );
  });

  it('situação fora das cinco da Receita mostra o texto informado (regra 14)', async () => {
    await renderData({
      registration_status: 'NAO_RECONHECIDA',
      registration_status_unrecognized: 'EM LIQUIDACAO',
    });

    expect(valueOf('Situação cadastral').textContent.trim()).toBe(
      'Não reconhecida (informada como "EM LIQUIDACAO")',
    );
  });

  it('sem CNAE secundário, diz que não há', async () => {
    await renderData({ secondary_cnaes: [] });

    expect(valueOf('Atividades secundárias').textContent.trim()).toBe('Nenhuma informada.');
  });

  it('não tem campo de sócio, administrador ou contato (INL02)', async () => {
    const { container } = await renderData();

    expect(container.textContent).not.toMatch(/sócio|administrador|telefone|e-mail|contato/i);
  });
});
