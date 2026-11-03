import type { CompanyEvidence } from '../../../core/api/generated';
import acoCearense from '../../../core/mocks/fixtures/getCompanyProfile/aco-cearense';
import atuante from '../../../core/mocks/fixtures/getCompanyProfile/atuante';
import { presentEvidence, retryHint, safeSourceUrl } from './evidence-presentation';

const ibama = acoCearense.body.evidences[0].evidences[0] as CompanyEvidence;
const ceis = atuante.body.evidences[1].evidences[0] as CompanyEvidence;

describe('apresentação das evidências', () => {
  it('aceita somente HTTPS absoluto sem credenciais', () => {
    expect(safeSourceUrl('https://dados.gov.br/registro')).toBe('https://dados.gov.br/registro');
    for (const value of [
      'http://dados.gov.br',
      '//dados.gov.br',
      'javascript:alert(1)',
      'https://user:pass@dados.gov.br',
      '/registro',
      null,
    ]) {
      expect(safeSourceUrl(value)).toBeNull();
    }
  });

  it('mostra fonte, referência, resumo e datas do registro rastreável', () => {
    const view = presentEvidence(ibama);
    expect(view.stateLabel).toBe('Registro encontrado');
    expect(view.reference).toBe('343440-D');
    expect(view.url).toContain('dadosabertos.ibama.gov.br');
    expect(view.summary).toContain('Multa simples');
    expect(view.publishedAt).toContain('12/09/2008');
  });

  it('rebaixa um achado sem referência nem URL e não exibe seu conteúdo', () => {
    const view = presentEvidence({
      ...ibama,
      source_reference: ' ',
      source_url: 'http://dados.gov.br/registro',
      state: 'CONFIRMED',
    });
    expect(view.state).toBe('UNKNOWN');
    expect(view.summary).toBeNull();
    expect(view.reference).toBeNull();
    expect(view.url).toBeNull();
    expect(view.sanctionPeriod).toBeNull();
  });

  it('não confunde sem registro com não verificado e não inventa sinal ou conteúdo', () => {
    const group = acoCearense.body.evidences[1].evidences;
    expect(presentEvidence(group[0] as CompanyEvidence).state).toBe('NOT_FOUND');
    expect(
      presentEvidence(acoCearense.body.evidences[2].evidences[0] as CompanyEvidence).state,
    ).toBe('UNKNOWN');
    expect(presentEvidence(group[0] as CompanyEvidence).summary).toBeNull();
  });

  it('mostra o período da sanção como dado da fonte, sem deduzir vigência', () => {
    const view = presentEvidence(ceis);
    expect(view.sanctionPeriod).toBe('13/03/2025 a 13/03/2028');
    expect(view.state).toBe('CONFIRMED');
  });

  it('explica o prazo sugerido de nova consulta', () => {
    expect(retryHint(90)).toContain('2 minutos');
    expect(retryHint(30)).toContain('30 segundos');
    expect(retryHint(null)).toContain('em instantes');
  });
});
