import { gzipSync } from 'node:zlib';
import type { Mock } from 'vitest';
import type { ArchivedCompany } from './company-archive';
import { StaticCompanyArchive } from './static-company-archive';

const INDEX = {
  statuses: ['ATIVA', 'BAIXADA'],
  places: [
    ['BELO HORIZONTE', 'MG'],
    ['SAO PAULO', 'SP'],
  ],
  cnaes: [
    ['2423702', 'PRODUÇÃO DE LAMINADOS LONGOS DE AÇO'],
    ['0210101', 'CULTIVO DE EUCALIPTO'],
  ],
  ods: [13, 15],
  rows: [
    ['17469701000177', 'ARCELORMITTAL BRASIL S.A.', null, 0, 0, 0, [1], 60, 0.08, -80, 0.5],
    ['04735087000104', 'SIDERMIN', 'SIDERMIN', 1, 1, 1, [], null, null, null, 0],
  ],
};
const COMPANY = {
  profile: { cnpj: '17469701000177' },
  explanations: {},
} as unknown as ArchivedCompany;

const gzipped = (value: unknown) => new Response(gzipSync(JSON.stringify(value)));

describe('StaticCompanyArchive', () => {
  let archive: StaticCompanyArchive;
  let fetchMock: Mock<typeof fetch>;

  beforeEach(() => {
    archive = new StaticCompanyArchive();
    fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('abre o índice comprimido e reconstrói as empresas a partir das tabelas', async () => {
    fetchMock.mockResolvedValue(gzipped(INDEX));

    const [first, second] = await archive.entries();

    expect(fetchMock).toHaveBeenCalledWith('presentation/v2/search.json.gz');
    expect(first).toEqual({
      cnpj: '17469701000177',
      legal_name: 'ARCELORMITTAL BRASIL S.A.',
      trade_name: null,
      registration_status: 'ATIVA',
      city: 'BELO HORIZONTE',
      uf: 'MG',
      main_cnae: { code: '2423702', description: 'PRODUÇÃO DE LAMINADOS LONGOS DE AÇO' },
      cnaes: ['2423702', '0210101'],
      scores: {
        13: { score_value: 60, confidence_value: 0.08 },
        15: { score_value: -80, confidence_value: 0.5 },
      },
    });
    expect(second.scores[13]).toEqual({ score_value: null, confidence_value: null });
  });

  it('baixa o índice uma vez só, mesmo com chamadas simultâneas', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(gzipped(INDEX)));

    await Promise.all([archive.entries(), archive.entries()]);
    await archive.entries();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('baixa só a fatia do CNPJ e a reaproveita para outra empresa da mesma fatia', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(gzipped({ '17469701000177': COMPANY })));

    await expect(archive.company('17469701000177')).resolves.toEqual(COMPANY);
    await expect(archive.company('17400000000100')).resolves.toBeNull();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('presentation/v2/companies/174.json.gz');
  });

  it('fatia que não existe é empresa fora da base, e não falha', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(archive.company('99999999000191')).resolves.toBeNull();
  });

  it('o index.html que a Vercel entrega no lugar de uma fatia inexistente não é falha', async () => {
    fetchMock.mockResolvedValue(
      new Response('<!doctype html>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } }),
    );

    await expect(archive.company('70645678000107')).resolves.toBeNull();
  });

  it('sem o índice a pesquisa fica indisponível, mesmo que a resposta seja a página do app', async () => {
    fetchMock.mockResolvedValue(
      new Response('<!doctype html>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } }),
    );

    await expect(archive.entries()).rejects.toMatchObject({ status: 503 });
  });

  it('falha de rede vira indisponibilidade, e a tentativa seguinte baixa de novo', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('offline'));
    fetchMock.mockImplementation(() => Promise.resolve(gzipped(INDEX)));

    await expect(archive.entries()).rejects.toMatchObject({ status: 503 });
    await expect(archive.entries()).resolves.toHaveLength(2);
  });

  it('arquivo corrompido também vira indisponibilidade, e não tela quebrada', async () => {
    fetchMock.mockResolvedValue(new Response('<!doctype html>'));

    await expect(archive.company('17469701000177')).rejects.toMatchObject({ status: 503 });
  });

  it('baixa a lista de movimentações uma vez, sem tocar no índice da pesquisa', async () => {
    const items = [{ cnpj: '17469701000177' }];

    fetchMock.mockImplementation(() => Promise.resolve(gzipped(items)));

    await expect(archive.movements()).resolves.toEqual(items);
    await archive.movements();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('presentation/v2/movements.json.gz');
  });

  it('download da lista que falha não fica guardado', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('offline'));
    fetchMock.mockImplementation(() => Promise.resolve(gzipped([])));

    await expect(archive.movements()).rejects.toMatchObject({ status: 503 });
    await expect(archive.movements()).resolves.toEqual([]);
  });

  it('entrega os setores e a série por divisão e ODS', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(
        gzipped({ sectors: { data: [] }, evolutions: { '24-13': { cnae_division: '24' } } }),
      ),
    );

    await expect(archive.sectors()).resolves.toEqual({ data: [] });
    await expect(archive.evolution('24', 13)).resolves.toEqual({ cnae_division: '24' });
    await expect(archive.evolution('24', 15)).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
