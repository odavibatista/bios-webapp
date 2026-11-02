import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { CompanyLookup } from './company-lookup';

describe('CompanyLookup', () => {
  it('oferece a consulta por CNPJ', async () => {
    await render(CompanyLookup, { providers: [provideRouter([])] });

    expect(screen.getByRole('heading', { level: 1, name: 'Empresas' })).toBeTruthy();
    expect(screen.getByRole('search', { name: 'Consultar empresa por CNPJ' })).toBeTruthy();
    expect(screen.queryByText(/CNPJ inválido/)).toBeNull();
  });

  it('o CNPJ inválido que veio da barra aparece no campo, com o erro', async () => {
    await render(CompanyLookup, { inputs: { cnpj: '123' }, providers: [provideRouter([])] });

    expect(screen.getByLabelText('CNPJ')).toHaveProperty('value', '123');
    expect(screen.getByText('CNPJ inválido. Confira os dígitos e tente de novo.')).toBeTruthy();
  });
});
