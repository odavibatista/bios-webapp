import type { AbstractControl, ValidatorFn } from '@angular/forms';
import { rules } from './account-rules';

/** Unidades da federação, em sigla, na ordem da API (`BRAZILIAN_STATES`). */
export const BRAZILIAN_STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const;

/** Os campos do endereço, com os nomes da API (os `details[].path` de um 422 são `address.<campo>`). */
export type AddressField =
  | 'postal_code'
  | 'street'
  | 'number'
  | 'complement'
  | 'neighborhood'
  | 'state'
  | 'city'
  | 'city_ibge_code';

export type AddressValue = Record<AddressField, string>;

function length(
  value: string,
  min: number,
  max: number,
  tooShort: string,
  tooLong: string,
): string[] {
  return [...(value.length < min ? [tooShort] : []), ...(value.length > max ? [tooLong] : [])];
}

/**
 * As regras de cada campo do endereço (UC05, regra 3), com as mensagens da API. Os textos são
 * comparados sem os espaços das bordas, como a API faz; o CEP aceita a forma com ou sem hífen.
 */
const FIELD_RULES: Record<AddressField, (value: string) => string[]> = {
  postal_code: (value) =>
    /^\d{5}-?\d{3}$/.test(value) ? [] : ['Informe um CEP válido (8 dígitos).'],
  street: (value) =>
    length(
      value.trim(),
      2,
      150,
      'Informe o logradouro.',
      'O logradouro deve ter no máximo 150 caracteres.',
    ),
  number: (value) =>
    length(value.trim(), 1, 20, 'Informe o número.', 'O número deve ter no máximo 20 caracteres.'),
  complement: (value) =>
    value.trim().length > 60 ? ['O complemento deve ter no máximo 60 caracteres.'] : [],
  neighborhood: (value) =>
    length(
      value.trim(),
      2,
      100,
      'Informe o bairro.',
      'O bairro deve ter no máximo 100 caracteres.',
    ),
  city: (value) =>
    length(
      value.trim(),
      2,
      100,
      'Informe a cidade.',
      'A cidade deve ter no máximo 100 caracteres.',
    ),
  city_ibge_code: () => [],
  state: (value) =>
    (BRAZILIAN_STATES as readonly string[]).includes(value)
      ? []
      : ['Informe a sigla de uma unidade da federação.'],
};

/**
 * Validador de um campo do endereço. O endereço é opcional: enquanto a conta não tem endereço e o
 * formulário está em branco, `required(control)` responde `false` e nada é cobrado (o controle
 * chega ao `required` para que ele olhe o grupo, em `control.parent`). O complemento só tem o
 * limite de tamanho, sempre.
 */
export function addressFieldRules(
  field: AddressField,
  required: (control: AbstractControl) => boolean,
): ValidatorFn {
  const check = rules(FIELD_RULES[field]);

  return (control) => (field === 'complement' || required(control) ? check(control) : null);
}

/** O endereço está todo em branco? */
export function isBlankAddress(value: Partial<AddressValue>): boolean {
  return Object.values(value).every((field) => !field?.trim());
}

/** Só os dígitos do CEP, até 8. */
export function postalCodeDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 8);
}

/** O CEP na forma `00000-000`, a partir do que foi digitado (máscara do campo). */
export function formatPostalCode(value: string): string {
  const digits = postalCodeDigits(value);

  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}
