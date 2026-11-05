import type { CompanyAddress, RegistrationStatus } from '../../../core/api/generated';

/** Situação cadastral em português (UC06, regra 14): as cinco da Receita Federal. */
const STATUS_LABELS: Record<Exclude<RegistrationStatus, 'NAO_RECONHECIDA'>, string> = {
  ATIVA: 'Ativa',
  SUSPENSA: 'Suspensa',
  INAPTA: 'Inapta',
  BAIXADA: 'Baixada',
  NULA: 'Nula',
};

/**
 * A situação cadastral como a tela a mostra. Situação fora das cinco não se perde: aparece como
 * não reconhecida, com o texto que o provedor informou.
 */
export function registrationStatusLabel(
  status: RegistrationStatus,
  unrecognized: string | null,
): string {
  if (status !== 'NAO_RECONHECIDA') return STATUS_LABELS[status];

  return unrecognized ? `Não reconhecida (informada como "${unrecognized}")` : 'Não reconhecida';
}

/** Portes na grafia única da API (`MICRO EMPRESA`, `EMPRESA DE PEQUENO PORTE`, `DEMAIS`). */
const SIZE_LABELS: Readonly<Record<string, string>> = {
  'MICRO EMPRESA': 'Microempresa (ME)',
  'EMPRESA DE PEQUENO PORTE': 'Empresa de pequeno porte (EPP)',
  DEMAIS: 'Demais (nem microempresa nem de pequeno porte)',
};

/** O porte em português; porte que a API não unificou aparece como veio. */
export function companySizeLabel(size: string | null): string {
  if (!size) return 'Não informado';

  return SIZE_LABELS[size] ?? size;
}

export { formatCnae } from '../../../shared/format/cnae';

/** CEP com hífen (`60761200` → `60761-200`). */
export function formatZipcode(zipcode: string): string {
  return zipcode.replace(/^(\d{5})(\d{3})$/, '$1-$2');
}

/** O endereço em linhas: logradouro, bairro, município/UF e CEP, sem as partes ausentes. */
export function addressLines(address: CompanyAddress): string[] {
  const street = [address.street, address.number, address.complement]
    .filter((part): part is string => !!part)
    .join(', ');

  return [
    street,
    address.neighborhood ?? '',
    `${address.city}/${address.uf}`,
    address.zipcode ? `CEP ${formatZipcode(address.zipcode)}` : '',
  ].filter(Boolean);
}
