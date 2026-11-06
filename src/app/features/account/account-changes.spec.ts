import type { AccountResponse } from '../../core/api/generated';
import { accountChanges, accountFormValue } from './account-changes';

const WITH_ADDRESS: AccountResponse = {
  id: '1',
  name: 'Conta de Demonstração',
  email: 'apresentacao@example.com',
  role: 'USER',
  address: {
    postal_code: '01310200',
    street: 'Avenida Paulista',
    number: '1578',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
  },
};

const WITHOUT_ADDRESS: AccountResponse = { ...WITH_ADDRESS, address: null };

describe('accountFormValue', () => {
  it('preenche com o que está gravado, com o CEP mascarado', () => {
    expect(accountFormValue(WITH_ADDRESS)).toEqual({
      name: 'Conta de Demonstração',
      address: {
        postal_code: '01310-200',
        street: 'Avenida Paulista',
        number: '1578',
        complement: '',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        city_ibge_code: '',
        state: 'SP',
      },
    });
  });

  it('sem endereço, os campos ficam em branco', () => {
    expect(Object.values(accountFormValue(WITHOUT_ADDRESS).address).every((v) => v === '')).toBe(
      true,
    );
  });
});

describe('accountChanges', () => {
  it('nada mudou: null (Salvar desabilitado)', () => {
    expect(accountChanges(WITH_ADDRESS, accountFormValue(WITH_ADDRESS))).toBeNull();
    expect(accountChanges(WITHOUT_ADDRESS, accountFormValue(WITHOUT_ADDRESS))).toBeNull();
  });

  it('espaços nas bordas e a máscara do CEP não contam como mudança', () => {
    const value = accountFormValue(WITH_ADDRESS);

    expect(
      accountChanges(WITH_ADDRESS, {
        name: '  Conta de Demonstração ',
        address: { ...value.address, street: ' Avenida Paulista ', postal_code: '01310-200' },
      }),
    ).toBeNull();
  });

  it('só o nome mudou: envia só o nome, sem os espaços das bordas', () => {
    expect(
      accountChanges(WITH_ADDRESS, { ...accountFormValue(WITH_ADDRESS), name: ' Nome Novo ' }),
    ).toEqual({ name: 'Nome Novo' });
  });

  it('um campo do endereço mudou: envia o endereço inteiro, com o CEP em dígitos', () => {
    const value = accountFormValue(WITH_ADDRESS);

    expect(
      accountChanges(WITH_ADDRESS, {
        ...value,
        address: { ...value.address, number: '1600', complement: ' Sala 2 ' },
      }),
    ).toEqual({
      address: {
        postal_code: '01310200',
        street: 'Avenida Paulista',
        number: '1600',
        complement: 'Sala 2',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
      },
    });
  });

  it('complemento em branco não vai no corpo', () => {
    const value = accountFormValue(WITHOUT_ADDRESS);
    const body = accountChanges(WITHOUT_ADDRESS, {
      ...value,
      address: {
        ...value.address,
        postal_code: '20040-020',
        street: 'Avenida Rio Branco',
        number: '1',
        neighborhood: 'Centro',
        city: 'Rio de Janeiro',
        state: 'RJ',
      },
    });

    expect(body?.address).toEqual({
      postal_code: '20040020',
      street: 'Avenida Rio Branco',
      number: '1',
      neighborhood: 'Centro',
      city: 'Rio de Janeiro',
      state: 'RJ',
    });
  });

  it('nome e endereço mudaram: envia os dois', () => {
    const value = accountFormValue(WITH_ADDRESS);
    const body = accountChanges(WITH_ADDRESS, {
      name: 'Outro Nome',
      address: { ...value.address, city: 'Santos' },
    });

    expect(body?.name).toBe('Outro Nome');
    expect(body?.address?.city).toBe('Santos');
  });

  it('endereço em branco não é remoção: a remoção é outra ação, com confirmação', () => {
    expect(
      accountChanges(WITH_ADDRESS, {
        name: 'Conta de Demonstração',
        address: accountFormValue(WITHOUT_ADDRESS).address,
      }),
    ).toBeNull();
  });
});
