import { Injectable } from '@angular/core';
import { ApiError } from '../api/api-error';
import type { CompanyMovementItem, ListSectorsResponse, SectorEvolution } from '../api/generated';
import {
  CompanyArchive,
  type ArchivedCompany,
  type CompanyEntry,
  type CompanyEntryScore,
} from './company-archive';

/** Versão no caminho: os arquivos são imutáveis, e uma base nova vem numa pasta nova. */
const BASE = 'presentation/v3';

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
