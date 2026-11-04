import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { ApiError } from '../../../core/api/api-error';
import { BiosApi } from '../../../core/api/bios-api';
import type { CompanyFullProfileResponse, ErrorResponse } from '../../../core/api/generated';
import acoCearense from '../../../core/mocks/fixtures/getCompanyProfile/aco-cearense';
import notFound from '../../../core/mocks/fixtures/getCompanyProfile/nao-encontrada';
import { CompanyProfile } from './company-profile';

const PROFILE = acoCearense.body as CompanyFullProfileResponse;

const UNAVAILABLE = new ApiError(503, {
  statusCode: 503,
  code: 'COMPANY_DATA_UNAVAILABLE',
  message: 'Os dados cadastrais estão temporariamente indisponíveis. Tente novamente em instantes.',
  timestamp: '2026-11-02T12:00:00.000Z',
  path: `/companies/${PROFILE.cnpj}`,
});

async function renderProfile(
  cnpj: string,
  getCompanyProfile: () => Promise<CompanyFullProfileResponse>,
) {
  const spy = vi.fn(getCompanyProfile);
  const result = await render(CompanyProfile, {
    inputs: { cnpj },
    providers: [provideRouter([]), { provide: BiosApi, useValue: { getCompanyProfile: spy } }],
  });

  return { ...result, getCompanyProfile: spy, user: userEvent.setup() };
}

describe('CompanyProfile', () => {
  it('mostra a razão social, o CNPJ formatado e os dados cadastrais, com a empresa na aba', async () => {
    const { getCompanyProfile } = await renderProfile(PROFILE.cnpj, () => Promise.resolve(PROFILE));

    expect(await screen.findByRole('heading', { level: 1, name: PROFILE.legal_name })).toBeTruthy();
    expect(screen.getByText('CNPJ 00.990.842/0001-38')).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Dados cadastrais' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Índices por ODS' })).toBeTruthy();
    expect(getCompanyProfile).toHaveBeenCalledWith({ path: { cnpj: '00990842000138' } });
    expect(TestBed.inject(Title).getTitle()).toBe(`${PROFILE.legal_name} — BIOS`);
  });

  it('CNPJ inválido na URL não chama a API e mostra o erro com o campo de busca', async () => {
    const { getCompanyProfile } = await renderProfile('00990842000139', () =>
      Promise.resolve(PROFILE),
    );

    expect(screen.getByRole('heading', { level: 1, name: 'CNPJ inválido' })).toBeTruthy();
    expect(screen.getAllByText('CNPJ inválido. Confira os dígitos e tente de novo.').length).toBe(
      2,
    );
    expect(getCompanyProfile).not.toHaveBeenCalled();
  });

  it('CNPJ válido fora da forma normalizada troca a URL, sem consultar a forma da URL', async () => {
    const navigate = vi.fn(() => Promise.resolve(true));
    const getCompanyProfile = vi.fn();
    await render(CompanyProfile, {
      inputs: { cnpj: '12abc34501de35' },
      providers: [provideRouter([]), { provide: BiosApi, useValue: { getCompanyProfile } }],
      configureTestBed: () => {
        vi.spyOn(TestBed.inject(Router), 'navigate').mockImplementation(navigate);
      },
    });

    expect(navigate).toHaveBeenCalledWith(['/empresas', '12ABC34501DE35'], { replaceUrl: true });
    expect(getCompanyProfile).not.toHaveBeenCalled();
  });

  it('404: a empresa não foi encontrada nas fontes, sem "Tentar de novo"', async () => {
    await renderProfile('99999998000147', () =>
      Promise.reject(new ApiError(404, notFound.body as ErrorResponse)),
    );

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Empresa não encontrada' }),
    ).toBeTruthy();
    expect(screen.getByText('Empresa não encontrada para o CNPJ informado.')).toBeTruthy();
    expect(screen.getByText(/Confira o número/).textContent).toContain('99.999.998/0001-47');
    expect(screen.queryByRole('button', { name: 'Tentar de novo' })).toBeNull();
  });

  it('503: indisponibilidade temporária, diferente de "não encontrada", e tentar de novo consulta outra vez', async () => {
    let calls = 0;
    const { user, getCompanyProfile } = await renderProfile(PROFILE.cnpj, () =>
      ++calls === 1 ? Promise.reject(UNAVAILABLE) : Promise.resolve(PROFILE),
    );

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Não foi possível consultar a empresa',
      }),
    ).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toContain(
      'Os dados cadastrais estão temporariamente indisponíveis.',
    );
    expect(screen.queryByText('Empresa não encontrada')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByRole('heading', { level: 1, name: PROFILE.legal_name })).toBeTruthy();
    expect(getCompanyProfile).toHaveBeenCalledTimes(2);
  });

  it('enquanto consulta, mostra o carregando', async () => {
    await renderProfile(PROFILE.cnpj, () => new Promise(() => undefined));

    expect(screen.getByRole('status').textContent).toContain('Consultando a empresa…');
  });
});
