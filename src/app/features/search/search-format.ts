import type { RegistrationStatus } from '../../core/api/generated';

/** Texto quando a empresa não tem índice no ODS escolhido: ausência de cálculo, não nota baixa. */
export const NO_SCORE = 'Sem índice';
/** Texto quando a confiança no ODS escolhido ainda não foi calculada. */
export const NO_CONFIDENCE = 'Sem cálculo';

const STATUS_LABELS: Record<RegistrationStatus, string> = {
  ATIVA: 'Ativa',
  SUSPENSA: 'Suspensa',
  INAPTA: 'Inapta',
  BAIXADA: 'Baixada',
  NULA: 'Nula',
  NAO_RECONHECIDA: 'Não reconhecida',
};

const SCORE = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
const CONFIDENCE = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** CNPJ com a máscara (`33.592.510/0001-54`); outro formato passa como veio. */
export function formatCnpj(cnpj: string): string {
  return /^\d{14}$/.test(cnpj)
    ? cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
    : cnpj;
}

/** Situação cadastral na Receita, como se lê. */
export function statusLabel(status: RegistrationStatus): string {
  return STATUS_LABELS[status];
}

/** Índice de aderência (−100 a 100), com até uma casa; sem índice, "Sem índice", nunca zero. */
export function formatScore(score: number | null | undefined): string {
  return score === null || score === undefined ? NO_SCORE : SCORE.format(score);
}

/** Confiança (0 a 1), com duas casas, sempre separada do índice. */
export function formatConfidence(confidence: number | null | undefined): string {
  return confidence === null || confidence === undefined
    ? NO_CONFIDENCE
    : CONFIDENCE.format(confidence);
}
