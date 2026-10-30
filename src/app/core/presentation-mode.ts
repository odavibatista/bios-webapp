import { InjectionToken } from '@angular/core';

/**
 * O app está na versão de apresentação, com os dados capturados da API em vez da API no ar? O
 * provedor mockado (`provideMockBiosApi`) liga o sinal; com a API real, ele fica desligado. As
 * telas o usam para os avisos próprios da apresentação (rodapé, links que o e-mail traria).
 */
export const PRESENTATION_MODE = new InjectionToken<boolean>('PRESENTATION_MODE', {
  factory: () => false,
});
