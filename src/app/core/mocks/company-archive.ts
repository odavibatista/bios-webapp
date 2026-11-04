import type {
  CompanyFullProfileResponse,
  ListSectorsResponse,
  ScoreExplanationResponse,
  SectorEvolution,
} from '../api/generated';

/** Índice e confiança de uma empresa num ODS, como a pesquisa os mostra. */
export interface CompanyEntryScore {
  score_value: number | null;
  confidence_value: number | null;
}

/** O que a pesquisa precisa saber de uma empresa, sem os detalhes do perfil. */
export interface CompanyEntry {
  cnpj: string;
  legal_name: string;
  trade_name: string | null;
  registration_status: CompanyFullProfileResponse['registration_status'];
  city: string;
  uf: string;
  main_cnae: CompanyFullProfileResponse['main_cnae'];
  /** Códigos do CNAE principal e dos secundários. */
  cnaes: readonly string[];
  /** Por número de ODS. */
  scores: Readonly<Record<number, CompanyEntryScore>>;
}

/** Tudo o que a API respondeu sobre uma empresa. */
export interface ArchivedCompany {
  profile: CompanyFullProfileResponse;
  explanations: Readonly<Record<number, ScoreExplanationResponse>>;
}

/**
 * Base de empresas da versão publicada: respostas da API real guardadas como arquivos estáticos e
 * baixadas sob demanda. Sem este provedor, o mock responde com as capturas de `fixtures/`.
 */
export abstract class CompanyArchive {
  abstract entries(): Promise<readonly CompanyEntry[]>;
  abstract company(cnpj: string): Promise<ArchivedCompany | null>;
  abstract sectors(): Promise<ListSectorsResponse>;
  abstract evolution(division: string, ods: number): Promise<SectorEvolution | null>;
}
