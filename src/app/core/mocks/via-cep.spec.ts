import { lookupViaCep } from './via-cep';

const BODY = {
  cep: '01310-200',
  logradouro: 'Avenida Paulista',
  complemento: 'de 1047 a 1865 - lado ímpar',
  bairro: 'Bela Vista',
  localidade: 'São Paulo',
  uf: 'SP',
  ibge: '3550308',
};

describe('lookupViaCep', () => {
  const answer = (body: unknown, status = 200) =>
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(body), { status }));

  it('consulta só o CEP e não lê número nem complemento', async () => {
    const fetchSpy = answer(BODY);

    await expect(lookupViaCep('01310200')).resolves.toEqual({
      kind: 'FOUND',
      address: {
        street: 'Avenida Paulista',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        ibgeCode: '3550308',
      },
    });
    expect(fetchSpy.mock.calls[0][0]).toBe('https://viacep.com.br/ws/01310200/json/');
  });

  it('CEP geral de município vem sem logradouro nem bairro', async () => {
    answer({ ...BODY, logradouro: '', bairro: ' ' });

    await expect(lookupViaCep('01310200')).resolves.toMatchObject({
      address: { street: null, neighborhood: null },
    });
  });

  it('código IBGE fora do formato fica nulo', async () => {
    answer({ ...BODY, ibge: '35' });

    await expect(lookupViaCep('01310200')).resolves.toMatchObject({
      address: { ibgeCode: null },
    });
  });

  it.each([[true], ['true']])('erro %j é CEP inexistente', async (erro) => {
    answer({ erro });

    await expect(lookupViaCep('99999999')).resolves.toEqual({ kind: 'NOT_FOUND' });
  });

  it('resposta sem município vale como serviço indisponível', async () => {
    answer({ cep: '01310-200' });

    await expect(lookupViaCep('01310200')).resolves.toEqual({ kind: 'UNAVAILABLE' });
  });

  it('erro HTTP vale como serviço indisponível', async () => {
    answer({}, 500);

    await expect(lookupViaCep('01310200')).resolves.toEqual({ kind: 'UNAVAILABLE' });
  });

  it('rede fora do ar ou prazo esgotado valem como serviço indisponível', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('timeout'));

    await expect(lookupViaCep('01310200')).resolves.toEqual({ kind: 'UNAVAILABLE' });
  });
});
