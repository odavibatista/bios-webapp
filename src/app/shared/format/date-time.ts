const BRASILIA_DATE_TIME = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});

/**
 * Data e hora no horário de Brasília (`30/10/2026, 10:36`), a mesma em qualquer fuso de quem
 * abre a tela: as datas da API vêm em UTC, e o BIOS fala do Brasil.
 */
export function formatDateTime(iso: string): string {
  return BRASILIA_DATE_TIME.format(new Date(iso));
}
