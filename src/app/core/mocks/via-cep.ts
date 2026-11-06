/** Prazo do RF39: passado este tempo, a pessoa preenche o endereço à mão. */
const TIMEOUT_MS = 3_000;

const BASE_URL = 'https://viacep.com.br/ws';

/** O que o ViaCEP responde e a tela usa. */
export interface ViaCepAddress {
  street: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  ibgeCode: string | null;
}

/** O que a consulta deu, sem exceção para falhas esperadas. */
export type ViaCepResult =
  { kind: 'FOUND'; address: ViaCepAddress } | { kind: 'NOT_FOUND' } | { kind: 'UNAVAILABLE' };

interface ViaCepBody {
  erro?: boolean | string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  ibge?: string;
}

function textOf(value: string | undefined): string | null {
  const text = value?.trim();

  return text === undefined || text === '' ? null : text;
}

/**
 * Consulta o ViaCEP direto do navegador: a versão de apresentação não tem API. Só o CEP sai daqui,
 * e o rodapé e a página de privacidade avisam disso. Número e complemento nunca são lidos, como na
 * API (`viacep.mapper.ts`).
 */
export async function lookupViaCep(cep: string): Promise<ViaCepResult> {
  try {
    const response = await fetch(`${BASE_URL}/${cep}/json/`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) return { kind: 'UNAVAILABLE' };

    const body = (await response.json()) as ViaCepBody;

    if (body.erro === true || body.erro === 'true') return { kind: 'NOT_FOUND' };

    const city = textOf(body.localidade);
    const state = textOf(body.uf);

    if (city === null || state === null) return { kind: 'UNAVAILABLE' };

    return {
      kind: 'FOUND',
      address: {
        street: textOf(body.logradouro),
        neighborhood: textOf(body.bairro),
        city,
        state,
        ibgeCode: /^\d{7}$/.test(body.ibge ?? '') ? (body.ibge ?? null) : null,
      },
    };
  } catch {
    return { kind: 'UNAVAILABLE' };
  }
}
