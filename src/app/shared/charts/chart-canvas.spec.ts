import { time } from 'echarts/core';
import './chart-canvas';

describe('ChartCanvas', () => {
  it('escreve os meses do eixo de tempo em português', () => {
    const months = ['2026-02-15', '2026-05-15', '2026-09-15', '2026-12-15'];

    expect(months.map((month) => time.format(month, '{MMM}', true, 'PT-BR'))).toEqual([
      'Fev',
      'Mai',
      'Set',
      'Dez',
    ]);
  });
});
