import { Injectable } from '@angular/core';
import { ApiError } from '../api/api-error';
import type {
  CompanyAnalytics,
  CompanyMovementItem,
  ListSectorsResponse,
  SectorEvolution,
} from '../api/generated';
import type { CompanyFacts } from './company-analytics';
import type { LocationRows } from './location-catalog';
import {
  CompanyArchive,
  type ArchivedCompany,
  type CompanyEntry,
  type CompanyEntryScore,
} from './company-archive';

/** Versão no caminho: os arquivos são imutáveis, e uma base nova vem numa pasta nova. */
const BASE = 'presentation/v5';

/** `cnpj`, nomes, tabelas e índices: ver `scripts/build-presentation-data.mjs`. */
interface SearchIndex {
  statuses: CompanyEntry['registration_status'][];
  places: [city: string, uf: string][];
  cnaes: [code: string, description: string][];
  ods: number[];
  rows: [
    cnpj: string,
    legalName: string,
    tradeName: string | null,
    status: number,
    place: number,
    mainCnae: number,
    secondaryCnaes: number[],
    ...scores: (number | null)[],
  ][];
}

/** Fatos das empresas, na ordem do índice: ver `packFacts` no gerador. */
interface AnalyticsArchive {
  sizes: (string | null)[];
  natures: [code: string | null, label: string | null][];
  biomes: string[];
  infractionTypes: string[];
  sanctions: string[];
  rows: [
    size: number,
    nature: number,
    sector: string,
    confirmed: number,
    fineNotices: number,
    fineAmount: number,
    hectares: number,
    biomes: number[],
    infractionTypes: number[],
    sanctions: number[],
    years: number[],
  ][];
}

interface SectorArchive {
  sectors: ListSectorsResponse;
  evolutions: Record<string, SectorEvolution>;
}

type Shard = Record<string, ArchivedCompany>;

function unavailable(path: string): ApiError {
  return new ApiError(503, {
    statusCode: 503,
    code: 'SERVICE_UNAVAILABLE',
    message: 'Não foi possível carregar os dados agora. Verifique a conexão e tente de novo.',
    timestamp: new Date().toISOString(),
    path,
  });
}

/** Lê um arquivo da base: JSON comprimido, aberto pelo próprio navegador. */
async function readArchive<T>(file: string): Promise<T | null> {
  const path = `${BASE}/${file}.json.gz`;
  let response: Response;

  try {
    response = await fetch(path);
  } catch {
    throw unavailable(path);
  }
  // A Vercel responde 200 com o index.html para um arquivo que não existe, e não 404.
  const isAppPage = response.headers.get('Content-Type')?.includes('text/html');

  if (response.status === 404 || isAppPage) return null;
  if (!response.ok || !response.body) throw unavailable(path);

  try {
    const text = response.body.pipeThrough(new DecompressionStream('gzip'));

    return (await new Response(text).json()) as T;
  } catch {
    throw unavailable(path);
  }
}

/** Pares `[posição, quantidade]` de volta a `{ nome: quantidade }`. */
function unpack(
  pairs: readonly number[],
  names: readonly (string | number)[],
): Record<string, number> {
  const result: Record<string, number> = {};

  for (let i = 0; i < pairs.length; i += 2) result[names[pairs[i]]] = pairs[i + 1];

  return result;
}

function factsOf(archive: AnalyticsArchive, cnpjs: readonly string[]): Map<string, CompanyFacts> {
  const facts = new Map<string, CompanyFacts>();

  archive.rows.forEach((row, position) => {
    const [size, nature, sector, confirmed, notices, amount, hectares, biomes, types, sanctions] =
      row;
    const years = row[10];
    const yearCounts: Record<string, number> = {};

    for (let i = 0; i < years.length; i += 2) yearCounts[years[i]] = years[i + 1];

    facts.set(cnpjs[position], {
      size: archive.sizes[size],
      legalNature: archive.natures[nature],
      sector,
      confirmedEvidences: confirmed,
      fineNotices: notices,
      fineAmount: amount,
      hectares,
      biomes: unpack(biomes, archive.biomes),
      infractionTypes: unpack(types, archive.infractionTypes),
      sanctions: unpack(sanctions, archive.sanctions),
      years: yearCounts,
    });
  });

  return facts;
}

function entriesOf(index: SearchIndex): CompanyEntry[] {
  const cnaes = index.cnaes.map(([code, description]) => ({ code, description }));

  return index.rows.map((row) => {
    const [cnpj, legalName, tradeName, status, place, mainCnae, secondary] = row;
    const [city, uf] = index.places[place];
    const scores: Record<number, CompanyEntryScore> = {};

    index.ods.forEach((ods, i) => {
      scores[ods] = {
        score_value: row[7 + i * 2] as number | null,
        confidence_value: row[8 + i * 2] as number | null,
      };
    });

    return {
      cnpj,
      legal_name: legalName,
      trade_name: tradeName,
      registration_status: index.statuses[status],
      city,
      uf,
      main_cnae: cnaes[mainCnae],
      cnaes: [cnaes[mainCnae].code, ...secondary.map((i) => cnaes[i].code)],
      scores,
    };
  });
}

/**
 * Base publicada: respostas da API real em arquivos estáticos (`public/presentation`). A pesquisa
 * baixa o índice uma vez; cada perfil baixa só a fatia do seu CNPJ; a tela principal, só a própria
 * lista. Um download que falha não fica guardado, para "Tentar de novo" funcionar.
 */
@Injectable()
export class StaticCompanyArchive extends CompanyArchive {
  private index?: Promise<CompanyEntry[]>;
  private sectorData?: Promise<SectorArchive>;
  private movementList?: Promise<CompanyMovementItem[]>;
  private factList?: Promise<Map<string, CompanyFacts>>;
  private baseSummary?: Promise<CompanyAnalytics>;
  private locationRows?: Promise<LocationRows>;
  private readonly shards = new Map<string, Promise<Shard>>();

  entries(): Promise<readonly CompanyEntry[]> {
    this.index ??= this.required<SearchIndex>('search')
      .then(entriesOf)
      .catch((error: unknown) => {
        this.index = undefined;
        throw error;
      });

    return this.index;
  }

  baseAnalytics(): Promise<CompanyAnalytics> {
    this.baseSummary ??= this.required<CompanyAnalytics>('analytics-base').catch(
      (error: unknown) => {
        this.baseSummary = undefined;
        throw error;
      },
    );

    return this.baseSummary;
  }

  locations(): Promise<LocationRows> {
    this.locationRows ??= this.required<LocationRows>('locations').catch((error: unknown) => {
      this.locationRows = undefined;
      throw error;
    });

    return this.locationRows;
  }

  facts(): Promise<ReadonlyMap<string, CompanyFacts>> {
    this.factList ??= Promise.all([this.required<AnalyticsArchive>('analytics'), this.entries()])
      .then(([archive, entries]) =>
        factsOf(
          archive,
          entries.map(({ cnpj }) => cnpj),
        ),
      )
      .catch((error: unknown) => {
        this.factList = undefined;
        throw error;
      });

    return this.factList;
  }

  async company(cnpj: string): Promise<ArchivedCompany | null> {
    const prefix = cnpj.slice(0, 3);
    let shard = this.shards.get(prefix);

    if (!shard) {
      shard = readArchive<Shard>(`companies/${prefix}`).then((found) => found ?? {});
      this.shards.set(prefix, shard);
      shard.catch(() => this.shards.delete(prefix));
    }

    return (await shard)[cnpj] ?? null;
  }

  movements(): Promise<readonly CompanyMovementItem[]> {
    this.movementList ??= this.required<CompanyMovementItem[]>('movements').catch(
      (error: unknown) => {
        this.movementList = undefined;
        throw error;
      },
    );

    return this.movementList;
  }

  async sectors(): Promise<ListSectorsResponse> {
    return (await this.sectorArchive()).sectors;
  }

  async evolution(division: string, ods: number): Promise<SectorEvolution | null> {
    return (await this.sectorArchive()).evolutions[`${division}-${ods}`] ?? null;
  }

  private sectorArchive(): Promise<SectorArchive> {
    this.sectorData ??= this.required<SectorArchive>('sectors').catch((error: unknown) => {
      this.sectorData = undefined;
      throw error;
    });

    return this.sectorData;
  }

  private async required<T>(file: string): Promise<T> {
    const found = await readArchive<T>(file);

    if (found === null) throw unavailable(`${BASE}/${file}.json.gz`);

    return found;
  }
}
