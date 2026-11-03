import { filenameFromDisposition } from './export-file';

describe('filenameFromDisposition', () => {
  it('lê o nome capturado da API', () => {
    expect(filenameFromDisposition('attachment; filename="empresas-bios-2026-10-30.xlsx"')).toBe(
      'empresas-bios-2026-10-30.xlsx',
    );
  });

  it.each([
    undefined,
    'attachment; filename="../segredo.xlsx"',
    'attachment; filename="empresas-bios-2026-10-30.csv"',
  ])('recusa nome ausente ou fora do formato: %s', (value) => {
    expect(() => filenameFromDisposition(value)).toThrow('Nome do arquivo XLSX inválido');
  });
});
