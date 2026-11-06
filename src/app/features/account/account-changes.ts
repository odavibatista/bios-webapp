import type { AccountResponse, Address, UpdateAccountRequest } from '../../core/api/generated';
import {
  type AddressValue,
  formatPostalCode,
  isBlankAddress,
  postalCodeDigits,
} from '../../shared/forms/address-rules';

/** O formulário da conta: o nome e o endereço, campo a campo, como texto. */
export interface AccountFormValue {
  name: string;
  address: AddressValue;
}

/** O formulário preenchido com o que está gravado (endereço ausente: campos em branco). */
export function accountFormValue(account: AccountResponse): AccountFormValue {
  const address = account.address;

  return {
    name: account.name,
    address: {
      postal_code: address ? formatPostalCode(address.postal_code) : '',
      street: address?.street ?? '',
      number: address?.number ?? '',
      complement: address?.complement ?? '',
      neighborhood: address?.neighborhood ?? '',
      state: address?.state ?? '',
      city: address?.city ?? '',
      city_ibge_code: address?.city_ibge_code ?? '',
    },
  };
}

/** O endereço como a API o recebe; `null` quando o formulário está em branco. */
function addressFrom(value: AddressValue): Address | null {
  if (isBlankAddress(value)) return null;

  const complement = value.complement.trim();
  const cityCode = value.city_ibge_code.trim();

  return {
    postal_code: postalCodeDigits(value.postal_code),
    street: value.street.trim(),
    number: value.number.trim(),
    ...(complement ? { complement } : {}),
    neighborhood: value.neighborhood.trim(),
    city: value.city.trim(),
    ...(cityCode ? { city_ibge_code: cityCode } : {}),
    state: value.state as Address['state'],
  };
}

function sameAddress(a: Address, b: Address | null): boolean {
  return (
    b !== null &&
    postalCodeDigits(a.postal_code) === postalCodeDigits(b.postal_code) &&
    a.street === b.street &&
    a.number === b.number &&
    (a.complement ?? '') === (b.complement ?? '') &&
    a.neighborhood === b.neighborhood &&
    a.city === b.city &&
    (a.city_ibge_code ?? '') === (b.city_ibge_code ?? '') &&
    a.state === b.state
  );
}

/**
 * O que a edição envia (#23): só o que mudou em relação ao que está gravado, comparado sem os
 * espaços das bordas e com o CEP só em dígitos. Nada mudou: `null` (a API exige ao menos um
 * campo, e "Salvar" fica desabilitado). O endereço vai sempre inteiro, porque a API o troca de uma
 * vez; removê-lo é outra ação (`address: null`), com confirmação.
 */
export function accountChanges(
  account: AccountResponse,
  value: AccountFormValue,
): UpdateAccountRequest | null {
  const name = value.name.trim();
  const address = addressFrom(value.address);
  const body: UpdateAccountRequest = {
    ...(name !== account.name ? { name } : {}),
    ...(address && !sameAddress(address, account.address) ? { address } : {}),
  };

  return Object.keys(body).length ? body : null;
}
