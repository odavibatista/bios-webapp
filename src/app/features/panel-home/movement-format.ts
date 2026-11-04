import type { OdsMovement } from '../../core/api/generated';

interface DirectionView {
  label: string;
  icon: string;
}

/**
 * Como cada sentido aparece. O texto é neutro e a cor não muda com o sentido: o índice subir ou
 * descer não diz que a conduta da empresa melhorou ou piorou (IND01, IND03).
 */
const DIRECTIONS: Record<OdsMovement['direction'], DirectionView> = {
  INCREASED: { label: 'Índice subiu', icon: 'trending_up' },
  DECREASED: { label: 'Índice desceu', icon: 'trending_down' },
  AVAILABLE: { label: 'Índice calculado', icon: 'add_circle' },
  UNAVAILABLE: { label: 'Índice indisponível', icon: 'remove_circle' },
};

/** A sanção do CEIS/CNEP nunca aparece como infração ambiental (UC18, regra 6). */
const CATEGORIES: Record<OdsMovement['evidence_category'], { added: string; subject: string }> = {
  INFRACAO_AMBIENTAL: {
    added: 'Infração ambiental registrada',
    subject: 'infração ambiental',
  },
  CONDUTA_ADMINISTRATIVA: {
    added: 'Sanção administrativa registrada',
    subject: 'sanção administrativa',
  },
  EMISSAO_GEE: {
    added: 'Inventário de emissões registrado',
    subject: 'inventário de emissões',
  },
};

/** Em UTC, como no perfil: as fontes publicam dias, gravados à meia-noite UTC. */
const DAY = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'UTC' });

export function directionView(direction: OdsMovement['direction']): DirectionView {
  return DIRECTIONS[direction];
}

/** O que mudou o índice, como se lê (UC18, regra 5). */
export function causeLabel({ cause, evidence_category: category }: OdsMovement): string {
  const { added, subject } = CATEGORIES[category];

  if (cause === 'EVIDENCE_ADDED') return added;

  return cause === 'EVIDENCE_REMOVED'
    ? `A fonte deixou de listar: ${subject}`
    : `Peso alterado: ${subject}`;
}

/** A data da mudança (`03/11/2026`), sem hora: a evidência não a informa. */
export function formatMovementDate(iso: string): string {
  return DAY.format(new Date(iso));
}
