import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { render, screen } from '@testing-library/angular';
import { BiosApi } from '../../../core/api/bios-api';
import { provideMockBiosApi } from '../../../core/mocks/provide-mock-bios-api';
import { CompanyLookup } from './company-lookup';

describe('CompanyLookup', () => {
  it('oferece a consulta por CNPJ', async () => {
    await render(CompanyLookup, {
      providers: [provideRouter([]), provideMockBiosApi({ latencyMs: 0 })],
    });

    expect(screen.getByRole('heading', { level: 1, name: 'Empresas' })).toBeTruthy();
    expect(screen.getByRole('search', { name: 'Buscar empresa por CNPJ ou nome' })).toBeTruthy();
    expect(screen.queryByText(/CNPJ inválido/)).toBeNull();
  });

  it('o CNPJ inválido que veio da barra aparece no campo, com o erro', async () => {
    await render(CompanyLookup, {
      inputs: { cnpj: '123' },
      providers: [provideRouter([]), provideMockBiosApi({ latencyMs: 0 })],
    });

    expect(screen.getByLabelText('CNPJ ou nome da empresa')).toHaveProperty('value', '123');
    expect(screen.getByText('CNPJ inválido. Confira os dígitos e tente de novo.')).toBeTruthy();
  });

  it('a URL de nome e página usa searchCompanies com 20 itens e recusa nome inválido', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'empresas', component: CompanyLookup }]),
        provideMockBiosApi({ latencyMs: 0 }),
      ],
    });
    const search = vi.spyOn(TestBed.inject(BiosApi), 'searchCompanies');
    const harness = await RouterTestingHarness.create('/empresas?nome=Cearense&pagina=2');

    await vi.waitFor(() =>
      expect(search).toHaveBeenCalledWith({ query: { name: 'Cearense', page: 2, page_size: 20 } }),
    );
    await harness.navigateByUrl('/empresas?nome=SA');
    expect(screen.getByRole('alert').textContent).toContain('3 letras ou mais');
    expect(search).toHaveBeenCalledTimes(1);
  });
});
