/** Código CNAE com a máscara da classificação do IBGE (`2431800` → `2431-8/00`). */
export function formatCnae(code: string): string {
  return code.replace(/^(\d{4})(\d)(\d{2})$/, '$1-$2/$3');
}
