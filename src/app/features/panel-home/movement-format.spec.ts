import type { OdsMovement } from '../../core/api/generated';
import { causeLabel, directionView, formatMovementDate } from './movement-format';

function movement(
  cause: OdsMovement['cause'],
  category: OdsMovement['evidence_category'],
): OdsMovement {
  return {
    direction: 'DECREASED',
    cause,
    evidence_category: category,
    moved_at: '2026-11-03T12:00:00.000Z',
  };
}

describe('textos da movimentação', () => {
  it('cada sentido tem texto e ícone próprios', () => {
    const views = (['INCREASED', 'DECREASED', 'AVAILABLE', 'UNAVAILABLE'] as const).map(
      directionView,
    );

    expect(views.map(({ label }) => label)).toEqual([
      'Índice subiu',
      'Índice desceu',
      'Índice calculado',
      'Índice indisponível',
    ]);
    expect(new Set(views.map(({ icon }) => icon)).size).toBe(4);
  });

  it('diz o que entrou, sem chamar sanção de infração ambiental', () => {
    expect(causeLabel(movement('EVIDENCE_ADDED', 'INFRACAO_AMBIENTAL'))).toBe(
      'Infração ambiental registrada',
    );
    expect(causeLabel(movement('EVIDENCE_ADDED', 'CONDUTA_ADMINISTRATIVA'))).toBe(
      'Sanção administrativa registrada',
    );
    expect(causeLabel(movement('EVIDENCE_ADDED', 'EMISSAO_GEE'))).toBe(
      'Inventário de emissões registrado',
    );
  });

  it('diz o que saiu ou mudou de peso', () => {
    expect(causeLabel(movement('EVIDENCE_REMOVED', 'INFRACAO_AMBIENTAL'))).toBe(
      'A fonte deixou de listar: infração ambiental',
    );
    expect(causeLabel(movement('WEIGHT_CHANGED', 'CONDUTA_ADMINISTRATIVA'))).toBe(
      'Peso alterado: sanção administrativa',
    );
  });

  it('nenhum texto julga a empresa (IND01, IND03)', () => {
    const texts = (['EVIDENCE_ADDED', 'EVIDENCE_REMOVED', 'WEIGHT_CHANGED'] as const).flatMap(
      (cause) =>
        (['INFRACAO_AMBIENTAL', 'CONDUTA_ADMINISTRATIVA', 'EMISSAO_GEE'] as const).map((category) =>
          causeLabel(movement(cause, category)),
        ),
    );
    const labels = (['INCREASED', 'DECREASED', 'AVAILABLE', 'UNAVAILABLE'] as const).map(
      (direction) => directionView(direction).label,
    );

    expect([...texts, ...labels].join(' ')).not.toMatch(/melhor|pior|sustent|bom|ruim/i);
  });

  it('a data de publicação, à meia-noite UTC, não recua um dia', () => {
    expect(formatMovementDate('2026-11-03T00:00:00.000Z')).toBe('03/11/2026');
  });
});
