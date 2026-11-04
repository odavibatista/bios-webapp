import writeXlsxFile from 'write-excel-file/browser';
import type { CompanyEntry, CompanyEntryScore } from './company-archive';

/** Nome da planilha, como na API. */
const SHEET_NAME = 'Empresas';

const COMPANY_COLUMN_HEADERS = [
  'CNPJ',
  'Razão social',
  'Nome fantasia',
  'Situação cadastral',
  'UF',
  'Município',
  'CNAE principal',
  'Descrição do CNAE',
];
const COMPANY_COLUMN_WIDTHS = [18, 48, 36, 20, 6, 28, 16, 56];
const ODS_COLUMN_WIDTH = 16;
const NUMBER_FORMAT = '0.00';

const text = (value: string | null | undefined) =>
  value === null || value === undefined || value === '' ? null : { value, type: String };

const number = (value: number | null | undefined) =>
  value === null || value === undefined ? null : { value, type: Number, format: NUMBER_FORMAT };

const odsCells = (score: CompanyEntryScore | undefined) => [
  number(score?.score_value),
  number(score?.confidence_value),
];

/**
 * A planilha da lista de empresas (UC09), com as colunas e a ordem da exportação da API: dados
 * cadastrais e, em colunas separadas por ODS, índice e confiança. O que não foi calculado fica
 * como célula vazia, e não como zero.
 */
export function companiesWorkbook(
  companies: readonly CompanyEntry[],
  odsNumbers: readonly number[],
): Promise<Blob> {
  const header = [
    ...COMPANY_COLUMN_HEADERS,
    ...odsNumbers.flatMap((ods) => [`ODS ${ods} - Índice`, `ODS ${ods} - Confiança`]),
  ].map((title) => ({ value: title, type: String, fontWeight: 'bold' as const }));

  const rows = companies.map((company) => [
    text(company.cnpj),
    text(company.legal_name),
    text(company.trade_name),
    text(company.registration_status),
    text(company.uf),
    text(company.city),
    text(company.main_cnae?.code),
    text(company.main_cnae?.description),
    ...odsNumbers.flatMap((ods) => odsCells(company.scores[ods])),
  ]);

  return writeXlsxFile([header, ...rows], {
    sheet: SHEET_NAME,
    stickyRowsCount: 1,
    columns: [
      ...COMPANY_COLUMN_WIDTHS,
      ...odsNumbers.flatMap(() => [ODS_COLUMN_WIDTH, ODS_COLUMN_WIDTH]),
    ].map((width) => ({ width })),
  }).toBlob();
}
