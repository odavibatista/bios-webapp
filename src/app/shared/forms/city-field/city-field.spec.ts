import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { render, screen, waitFor } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { BiosApi } from '../../../core/api/bios-api';
import type { IbgeCity } from '../../../core/api/generated';
import { RULES_ERROR_KEY } from '../account-rules';
import { CHOOSE_CITY_MESSAGE, chosenCityRule, CityField } from './city-field';

const TERESINA: IbgeCity = { ibge_code: '2211001', name: 'Teresina', uf: 'PI' };
const ALTOS: IbgeCity = { ibge_code: '2200400', name: 'Altos', uf: 'PI' };

function page(data: IbgeCity[]) {
  return {
    data,
    pagination: { page: 1, page_size: 50, total: data.length, total_pages: 1 },
  };
}

@Component({
  imports: [CityField, ReactiveFormsModule],
  template: `<bios-city-field
    [ufControl]="form.controls.uf"
    [text]="form.controls.city"
    [code]="form.controls.city_ibge_code"
  />`,
})
class Host {
  readonly form = new FormGroup({
    uf: new FormControl('', { nonNullable: true }),
    city: new FormControl('', {
      nonNullable: true,
      validators: [chosenCityRule(() => 'Nome antigo')],
    }),
    city_ibge_code: new FormControl('', { nonNullable: true }),
  });
}

async function renderField(uf = '') {
  const listCities = vi.fn().mockResolvedValue(page([TERESINA, ALTOS]));
  const announce = vi.fn().mockResolvedValue(undefined);
  const view = await render(Host, {
    providers: [
      { provide: BiosApi, useValue: { listCities } },
      { provide: LiveAnnouncer, useValue: { announce } },
    ],
  });
  const { form } = view.fixture.componentInstance;

  form.controls.uf.setValue(uf);
  await view.fixture.whenStable();

  return {
    form,
    listCities,
    announce,
    fixture: view.fixture,
    user: userEvent.setup(),
    input: screen.getByLabelText<HTMLInputElement>('Município'),
  };
}

describe('CityField', () => {
  it('sem UF, fica desabilitado e explica por quê, sem consultar', async () => {
    const { input, listCities } = await renderField();

    expect(input.disabled).toBe(true);
    expect(screen.getByText('Escolha a UF primeiro.')).toBeTruthy();
    expect(listCities).not.toHaveBeenCalled();
  });

  it('com UF, habilita e consulta só quando a pessoa chega ao campo', async () => {
    const { input, listCities, user } = await renderField('PI');

    expect(input.disabled).toBe(false);
    expect(listCities).not.toHaveBeenCalled();

    await user.click(input);

    expect(await screen.findByRole('option', { name: 'Teresina' })).toBeTruthy();
    expect(listCities).toHaveBeenCalledWith({
      path: { uf: 'PI' },
      query: { search: '', page: 1, page_size: 50 },
    });
  });

  it('volta a desabilitar quando a UF sai', async () => {
    const { input, form, fixture } = await renderField('PI');

    form.controls.uf.setValue('');
    await fixture.whenStable();

    expect(input.disabled).toBe(true);
  });

  it('filtra pelo trecho digitado, com espera entre as teclas', async () => {
    const { input, listCities, user } = await renderField('PI');

    await user.type(input, 'tere');

    await waitFor(() => {
      expect(listCities).toHaveBeenLastCalledWith({
        path: { uf: 'PI' },
        query: { search: 'tere', page: 1, page_size: 50 },
      });
    });
    expect(
      listCities.mock.calls.filter(
        ([call]) => (call as { query: { search: string } }).query.search === 'te',
      ),
    ).toEqual([]);
  });

  it('escolher da lista grava o nome e o código', async () => {
    const { input, form, user } = await renderField('PI');

    await user.click(input);
    await user.click(await screen.findByRole('option', { name: 'Teresina' }));

    expect(form.controls.city.value).toBe('Teresina');
    expect(form.controls.city_ibge_code.value).toBe('2211001');
    expect(form.controls.city.valid).toBe(true);
  });

  it('digitar de novo desfaz o código escolhido', async () => {
    const { input, form, user } = await renderField('PI');

    await user.click(input);
    await user.click(await screen.findByRole('option', { name: 'Teresina' }));
    await user.type(input, 'x');

    expect(form.controls.city_ibge_code.value).toBe('');
    expect(form.controls.city.errors?.[RULES_ERROR_KEY]).toEqual([CHOOSE_CITY_MESSAGE]);
  });

  it('o nome inteiro digitado vale como escolhido ao sair do campo', async () => {
    const { input, form, listCities, user } = await renderField('PI');

    await user.click(input);
    await screen.findByRole('option', { name: 'Teresina' });
    await user.type(input, 'TERESINA');
    await waitFor(() => {
      expect(listCities).toHaveBeenCalledTimes(2);
    });
    await user.tab();

    expect(form.controls.city.value).toBe('Teresina');
    expect(form.controls.city_ibge_code.value).toBe('2211001');
  });

  it('anuncia quantos municípios encontrou', async () => {
    const { input, announce, user } = await renderField('PI');

    await user.click(input);

    await waitFor(() => {
      expect(announce).toHaveBeenCalledWith('2 municípios encontrados');
    });
  });

  it('anuncia um município no singular', async () => {
    const { input, announce, listCities, user } = await renderField('PI');

    listCities.mockResolvedValue(page([TERESINA]));
    await user.click(input);

    await waitFor(() => {
      expect(announce).toHaveBeenCalledWith('1 município encontrado');
    });
  });

  it('sem resultado, diz que não encontrou', async () => {
    const { input, listCities, user } = await renderField('PI');

    listCities.mockResolvedValue(page([]));
    await user.click(input);

    expect(await screen.findByText('Nenhum município encontrado nesta UF.')).toBeTruthy();
  });

  it('falha ao carregar oferece tentar de novo', async () => {
    const { input, listCities, user } = await renderField('PI');

    listCities.mockRejectedValueOnce(new Error('fora do ar'));
    await user.click(input);
    await user.click(await screen.findByRole('option', { name: /Tentar de novo/ }));
    await user.click(input);

    expect(await screen.findByRole('option', { name: 'Altos' })).toBeTruthy();
  });
});

describe('chosenCityRule', () => {
  const form = (city: string, code: string, kept: string | null = null) =>
    new FormGroup({
      city: new FormControl(city, {
        nonNullable: true,
        validators: [chosenCityRule(() => kept)],
      }),
      city_ibge_code: new FormControl(code, { nonNullable: true }),
    });

  it('campo vazio não é cobrado aqui', () => {
    expect(form('', '').controls.city.valid).toBe(true);
  });

  it('nome sem código precisa vir da lista', () => {
    expect(form('Terezina', '').controls.city.errors).toEqual({
      [RULES_ERROR_KEY]: [CHOOSE_CITY_MESSAGE],
    });
  });

  it('nome com código vale', () => {
    const group = form('Teresina', '');

    group.controls.city_ibge_code.setValue('2211001');
    group.controls.city.updateValueAndValidity();

    expect(group.controls.city.valid).toBe(true);
  });

  it('o nome já aceito continua valendo', () => {
    expect(form('São Paulo', '', 'São Paulo').controls.city.valid).toBe(true);
  });
});
