import { TestBed } from '@angular/core/testing';
import { capturedError, capturedFieldMessage, notInPresentation } from './mock-captures';
import { DEFAULT_MOCK_API_CONFIG, MOCK_API_CONFIG } from './mock-config';
import { PRESENTATION_MODE } from '../presentation-mode';
import { MockFiles } from './mock-files';
import { provideMockBiosApi } from './provide-mock-bios-api';

describe('apoio do mock', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('MockFiles', () => {
    it('lê a planilha publicada em mocks/ com o tipo da resposta', async () => {
      const fetchMock = vi.fn(() => Promise.resolve(new Response('xlsx', { status: 200 })));

      vi.stubGlobal('fetch', fetchMock);
      const blob = await TestBed.inject(MockFiles).load(
        'exportCompaniesXlsx',
        'nome.xlsx',
        'application/xlsx',
      );

      expect(fetchMock).toHaveBeenCalledWith('mocks/exportCompaniesXlsx/nome.xlsx');
      expect(blob.type).toBe('application/xlsx');
      expect(blob.size).toBe(4);
    });

    it('arquivo ausente é falha do app, e não resposta da API', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(() => Promise.resolve(new Response('', { status: 404 }))),
      );

      await expect(
        TestBed.inject(MockFiles).load('exportCompaniesXlsx', 'x.xlsx', 'a'),
      ).rejects.toThrow('Arquivo capturado ausente: exportCompaniesXlsx/x.xlsx');
    });
  });

  it('o provedor mockado liga o modo apresentação; sem ele, o modo fica desligado', () => {
    expect(TestBed.inject(PRESENTATION_MODE)).toBe(false);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideMockBiosApi()] });

    expect(TestBed.inject(PRESENTATION_MODE)).toBe(true);
  });

  it('sem configuração própria, vale a padrão, com o relógio real e latência', () => {
    const config = TestBed.inject(MOCK_API_CONFIG);

    expect(config).toBe(DEFAULT_MOCK_API_CONFIG);
    expect(config.latencyMs).toBeGreaterThan(0);
    expect(Math.abs(config.now() - Date.now())).toBeLessThan(1000);
  });

  describe('capturas', () => {
    it('erro só a partir de resposta de erro', () => {
      expect(() => capturedError('listOds/sucesso', '/ods', 0)).toThrow(
        'não é uma resposta de erro',
      );
    });

    it('mensagem de campo só se a captura a tiver', () => {
      expect(capturedFieldMessage('login/validacao', 'password')).toBe('Informe a senha.');
      expect(() => capturedFieldMessage('login/validacao', 'name')).toThrow(
        'não tem mensagem para name',
      );
    });

    it('o que a apresentação não reproduz é avisado com um 422 próprio', () => {
      const error = notInPresentation('/x', Date.parse('2026-10-30T00:00:00Z'), 'Não disponível.');

      expect(error).toMatchObject({
        status: 422,
        code: 'NOT_AVAILABLE_IN_PRESENTATION',
        message: 'Não disponível.',
      });
      expect(error.body.timestamp).toBe('2026-10-30T00:00:00.000Z');
    });
  });
});
