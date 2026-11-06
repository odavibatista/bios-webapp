import { By } from '@angular/platform-browser';
import { render } from '@testing-library/angular';
import { time } from 'echarts/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { ChartCanvas } from './chart-canvas';
import type { ChartSpec } from './chart-spec';

const SPEC: ChartSpec = {
  label: 'Gráfico',
  height: 10,
  options: () => ({}),
  table: { headers: [], rows: [] },
};

describe('ChartCanvas', () => {
  it('desenha com o idioma registrado, em que os meses saem em português', async () => {
    const { fixture } = await render(ChartCanvas, { inputs: { spec: SPEC } });
    const chart = fixture.debugElement.query(By.directive(NgxEchartsDirective));
    const { initOpts } = chart.injector.get(NgxEchartsDirective);
    const locale = initOpts()?.locale;
    const months = ['2026-02-15', '2026-05-15', '2026-09-15', '2026-12-15'];

    expect(locale).toBe('PT-BR');
    expect(months.map((month) => time.format(month, '{MMM}', true, 'PT-BR'))).toEqual([
      'Fev',
      'Mai',
      'Set',
      'Dez',
    ]);
  });

  it('a legenda em HTML traz o percentual de cada categoria', async () => {
    const { container } = await render(ChartCanvas, {
      inputs: { spec: { ...SPEC, legend: [{ label: 'Ativa', share: '85,7%', color: '#3f7f3f' }] } },
    });

    expect(container.querySelector('li')?.textContent).toContain('Ativa 85,7%');
  });
});
