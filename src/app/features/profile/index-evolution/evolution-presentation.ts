import type { CompanyIndexEvolution } from '../../../core/api/generated';
import { stepChart } from '../../../shared/charts/chart-builders';
import type { ChartSpec } from '../../../shared/charts/chart-spec';
import { formatScorePoints } from '../ods-scores/score-presentation';

type OdsEvolution = CompanyIndexEvolution['ods'][number];
type Step = OdsEvolution['steps'][number];

export interface EvolutionCard {
  ods: number;
  heading: string;
  chart: ChartSpec | null;
  emptyMessage: string;
  emptyIcon: string;
}

/** Vale para quem lê a tela e para quem lê a tabela: a série não foi gravada na época. */
export const RECONSTRUCTED_NOTICE =
  'Série reconstruída com as regras atuais, a partir das evidências disponíveis hoje.';

/**
 * Por que não há curva. Nenhuma mensagem cita o porte da empresa: o motivo é o cadastro ligado a
 * uma pessoa, ou a falta de datas, e nunca o tamanho do negócio.
 */
const NO_SERIES: Record<
  Exclude<OdsEvolution['status'], 'AVAILABLE'>,
  { message: string; icon: string }
> = {
  INDIVIDUAL_ENTREPRENEUR: {
    icon: 'person',
    message:
      'Evolução não exibida para empresário individual. Neste cadastro, a curva ficaria ligada a uma pessoa. A linha do tempo mostra as mesmas evidências.',
  },
  SHORT_HISTORY: {
    icon: 'hourglass_top',
    message:
      'Ainda não há histórico para mostrar a evolução. As evidências desta empresa estão em um único ano.',
  },
  NO_DATED_EVIDENCE: {
    icon: 'info',
    message: 'Sem evidências com data para mostrar a evolução.',
  },
  LEGAL_NATURE_PENDING: {
    icon: 'info',
    message: 'A evolução aparece depois da próxima atualização do cadastro.',
  },
  NOT_REPRODUCIBLE: {
    icon: 'info',
    message: 'Não foi possível reconstruir a evolução com as evidências disponíveis hoje.',
  },
};

/** Só o que aconteceu: nada de "melhorou" ou "piorou", nem o tamanho da mudança (IND03). */
const CAUSES: Record<Step['cause'], string> = {
  EVIDENCE_ADDED: 'Evidência passou a contar',
  EVIDENCE_REMOVED: 'Evidência deixou de contar',
  WEIGHT_CHANGED: 'O peso da evidência mudou',
};

const DAY = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' });

const formatDay = (iso: string) => DAY.format(new Date(iso));

function evidenceLabel({ evidence, evidence_count }: Step): string {
  const name = evidence.source_reference
    ? `${evidence.source}, ${evidence.source_reference}`
    : evidence.source;
  const others = evidence_count - 1;

  if (others < 1) return name;

  return `${name} e mais ${String(others)} ${others === 1 ? 'evidência' : 'evidências'} na data`;
}

export function evolutionCard({ ods_number: ods, status, steps }: OdsEvolution): EvolutionCard {
  const heading = `Evolução do índice no ODS ${String(ods)}`;

  if (status !== 'AVAILABLE') {
    const { message, icon } = NO_SERIES[status];

    return { ods, heading, chart: null, emptyMessage: message, emptyIcon: icon };
  }

  const first = formatDay(steps[0].date);
  const last = formatDay(steps[steps.length - 1].date);

  return {
    ods,
    heading,
    emptyMessage: '',
    emptyIcon: 'info',
    chart: stepChart({
      label: `Gráfico em degraus do índice do ODS ${String(ods)}, de ${first} a ${last}. Os mesmos números estão na tabela.`,
      points: steps.map(({ date, score_value }) => ({ date, value: score_value })),
      format: formatScorePoints,
      tooltip: (index) => {
        const step = steps[index];

        return [
          formatDay(step.date),
          `Índice: ${formatScorePoints(step.score_value)}`,
          CAUSES[step.cause],
          evidenceLabel(step),
        ];
      },
      table: {
        headers: ['Data', 'Evidência', 'Índice'],
        rows: steps.map((step) => [
          formatDay(step.date),
          `${CAUSES[step.cause]}: ${evidenceLabel(step)}`,
          formatScorePoints(step.score_value),
        ]),
      },
    }),
  };
}
