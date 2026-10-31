import { PANEL_PATH, safeReturnUrl } from './return-url';

describe('safeReturnUrl', () => {
  it.each([
    ['/setores', '/setores'],
    ['/empresas/33592510000154?ods=13', '/empresas/33592510000154?ods=13'],
    ['/admin/dominios-bloqueados', '/admin/dominios-bloqueados'],
    ['/entrar-depois', '/entrar-depois'],
  ])('caminho do app %j é aceito', (value, expected) => {
    expect(safeReturnUrl(value)).toBe(expected);
  });

  it.each([
    [undefined],
    [null],
    [''],
    [['/setores']],
    ['setores'],
    ['https://outro-site.example/roubo'],
    ['//outro-site.example'],
    ['/\\outro-site.example'],
    ['javascript:alert(1)'],
    ['/entrar'],
    ['/entrar?voltar=%2Fsetores'],
  ])('%j leva ao painel', (value) => {
    expect(safeReturnUrl(value)).toBe(PANEL_PATH);
  });
});
