import { render, screen } from '@testing-library/angular';
import { FormErrorSummary } from './form-error-summary';

describe('FormErrorSummary', () => {
  it('mostra no topo, como alerta, os erros que não são de um campo', async () => {
    await render(FormErrorSummary, {
      inputs: { messages: ['Informe ao menos um critério.', 'A senha atual está incorreta.'] },
    });

    const alert = screen.getByRole('alert');

    expect(alert.textContent).toContain('Informe ao menos um critério.');
    expect(alert.textContent).toContain('A senha atual está incorreta.');
  });

  it('sem erros, não ocupa espaço nem anuncia nada', async () => {
    await render(FormErrorSummary);

    expect(screen.queryByRole('alert')).toBeNull();
  });
});
