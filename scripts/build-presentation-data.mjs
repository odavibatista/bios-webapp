// Monta a base publicada a partir das respostas da API guardadas pelo rastreador.
//
// Uso: node --experimental-strip-types scripts/build-presentation-data.mjs <pasta do dump> <bios-core-api>
//
// Entrada: <dump>/NNN.jsonl (uma empresa por linha, com perfil e explicações, como a API respondeu)
// e <dump>/sectors.json (setores e séries, depois de `reconstruct-sector-history.mjs`). Opcionais:
// <dump>/legal-nature.json (natureza jurídica por CNPJ-base, lida do arquivo Empresas da Receita) e
// <dump>/removed-cnpjs.json (lista dos cadastros retirados a pedido do titular, que não entram em
// nenhum arquivo). A lista fica no dump, fora do repositório: publicá-la identificaria quem pediu.
// Saída: public/presentation/v5:
//   manifest.json            data da captura e contagens
//   search.json.gz           índice leve da pesquisa, com tabelas para não repetir texto
//   companies/NNN.json.gz    empresas cujo CNPJ começa em NNN, sem alterar as respostas da API,
//                            mais a evolução do índice, calculada com as regras da própria API
//   analytics.json.gz        fatos de cada empresa para o panorama, na ordem do índice da pesquisa
//   analytics-base.json.gz   o panorama da base inteira, pronto: abre sem baixar o índice
//   sectors.json.gz          setores e evolução por divisão e ODS
//   movements.json.gz        as empresas de movimentação mais recente, já na ordem da lista
//
// A publicação falha se a base trouxer indício de dado pessoal (INL02) ou se a soma das
// contribuições de um índice não reproduzir o valor exibido (RF12): dado errado não vai ao ar.
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import {
  byMostRecentMovement,
  companyMovementOf,
  PUBLISHED_MOVEMENTS_LIMIT,
} from '../src/app/core/mocks/company-movements.ts';
import { companyFacts, summarizeCompanies } from '../src/app/core/mocks/company-analytics.ts';
import { loadCoreRules, storedEvidences } from './core-rules.mjs';

const [dump, core] = process.argv.slice(2);
if (!dump || !core) throw new Error('Informe a pasta do dump e a do bios-core-api.');

const OUT = fileURLToPath(new URL('../public/presentation/v5/', import.meta.url));
const ODS = [13, 15];
const CPF_FORMATTED = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/;
const CPF_DIGITS = /(?<![\w.\-/])\d{11}(?![\w.\-/])/;
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PERSONAL_KEYS = /^(qsa|socios?|email|telefone|phone|ddd|cpf)/i;
const DIRECTIONS = ['INCREASED', 'DECREASED', 'AVAILABLE', 'UNAVAILABLE'];
const NOW = Date.now();

const optionalJson = (name, fallback) =>
  existsSync(join(dump, name)) ? JSON.parse(readFileSync(join(dump, name), 'utf8')) : fallback;
const legalNatures = optionalJson('legal-nature.json', {});
const removed = new Set(optionalJson('removed-cnpjs.json', []));

const problems = [];
const problem = (cnpj, text) => {
  if (problems.length < 30) problems.push(`${cnpj}: ${text}`);
  problems.count = (problems.count ?? 0) + 1;
};

/** Procura dado pessoal em todo texto da resposta; o CNPJ e as referências da fonte têm outro formato. */
function audit(cnpj, value, key = '') {
  if (typeof value === 'string') {
    if (CPF_FORMATTED.test(value) || CPF_DIGITS.test(value) || EMAIL.test(value)) {
      problem(cnpj, `texto suspeito em ${key}`);
    }
    if (/localhost|127\.0\.0\.1/.test(value)) problem(cnpj, `endereço local em ${key}`);
  } else if (Array.isArray(value)) {
    value.forEach((item) => audit(cnpj, item, key));
  } else if (value && typeof value === 'object') {
    for (const [name, item] of Object.entries(value)) {
      if (PERSONAL_KEYS.test(name)) problem(cnpj, `campo ${name}`);
      audit(cnpj, item, name);
    }
  }
}

function checkScores(cnpj, explanations) {
  for (const explanation of Object.values(explanations)) {
    const sum = explanation.contributions.reduce((total, item) => total + item.points, 0);
    if (explanation.score_value !== null && Math.abs(sum - explanation.score_value) > 1e-9) {
      problem(cnpj, `soma ${sum} diferente do índice ${explanation.score_value}`);
    }
  }
}

/** A reconstrução já é a da tela: aqui só se recusa o que a tela não saberia mostrar. */
function checkMovement(item) {
  for (const { movement } of item.ods) {
    if (movement && !DIRECTIONS.includes(movement.direction)) {
      problem(item.cnpj, `sentido ${movement.direction}`);
    }
  }
}

const { buildOdsEvolution } = await loadCoreRules(core, 'evolution-rules', {
  'scoring/domain/ods-evolution.js': ['buildOdsEvolution'],
});

/** A resposta de `GET /companies/:cnpj/index-evolution`, sem chamar a API. */
function evolutionOf(cnpj, profile, explanations) {
  const code = profile.legal_nature_code?.replace(/\D/g, '') ?? null;
  const scores = Object.values(explanations).sort((a, b) => a.ods_number - b.ods_number);
  const blocked =
    code === null ? 'LEGAL_NATURE_PENDING' : code === '2135' ? 'INDIVIDUAL_ENTREPRENEUR' : null;
  const stored = new Map(storedEvidences(cnpj, profile).map((item) => [item.id, item]));

  const ods = scores.map(({ ods_number, score_value, calculated_at, contributions }) => {
    if (blocked) return { ods_number, status: blocked, steps: [] };
    if (score_value === null) return { ods_number, status: 'NO_DATED_EVIDENCE', steps: [] };

    const { status, steps } = buildOdsEvolution({
      odsNumber: ods_number,
      evidences: contributions.flatMap(({ evidence }) => stored.get(evidence.id) ?? []),
      scoreValue: score_value,
      calculatedAt: new Date(calculated_at),
    });

    if (status === 'NOT_REPRODUCIBLE') problem(cnpj, `evolução do ODS ${ods_number} sem fechar`);

    return {
      ods_number,
      status,
      steps: steps.map(({ date, scoreValue, cause, evidenceId, evidenceCount }) => {
        const { evidence } = contributions.find((item) => item.evidence.id === evidenceId);

        return {
          date: date.toISOString(),
          score_value: scoreValue,
          cause,
          evidence_count: evidenceCount,
          evidence: {
            id: evidenceId,
            category: evidence.category,
            source_slug: evidence.source_slug,
            source: evidence.source,
            summary: stored.get(evidenceId)?.summary ?? null,
            source_reference: evidence.source_reference,
            source_url: evidence.source_url,
          },
        };
      }),
    };
  });

  return { cnpj, reconstructed: true, ods };
}

class Table {
  values = [];
  positions = new Map();
  of(key, value) {
    let position = this.positions.get(key);
    if (position === undefined) {
      position = this.values.length;
      this.positions.set(key, position);
      this.values.push(value);
    }
    return position;
  }
}

const gz = (value) => gzipSync(JSON.stringify(value), { level: 9 });

/** Fatos de uma empresa em forma compacta: posições nas tabelas, sem nenhum nome. */
function packFacts(item) {
  const pack = (group, values) =>
    Object.entries(values).flatMap(([key, count]) => [categories[group].of(key, key), count]);

  return [
    sizes.of(String(item.size), item.size),
    natures.of(String(item.legalNature[0]), item.legalNature),
    item.sector,
    item.confirmedEvidences,
    item.fineNotices,
    item.fineAmount,
    item.hectares,
    pack('biomes', item.biomes),
    pack('infractionTypes', item.infractionTypes),
    pack('sanctions', item.sanctions),
    Object.entries(item.years).flat().map(Number),
  ];
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'companies'), { recursive: true });

const statuses = new Table();
const places = new Table();
const cnaes = new Table();
const rows = [];
const movements = [];
const facts = new Map();
const analyticsCompanies = [];
const sizes = new Table();
const natures = new Table();
const categories = { biomes: new Table(), infractionTypes: new Table(), sanctions: new Table() };
const seen = new Set();
let evidences = 0;
let biggest = 0;
let capturedAt = '';
const coverage = { com_indice_13: 0, com_indice_15: 0 };

for (const file of readdirSync(dump)
  .filter((name) => /^\w{3}\.jsonl$/.test(name))
  .sort()) {
  const shard = {};
  for await (const line of createInterface({
    input: createReadStream(join(dump, file), 'utf8'),
    crlfDelay: Infinity,
  })) {
    if (!line) continue;
    const { cnpj, profile, explanations } = JSON.parse(line);
    if (seen.has(cnpj) || removed.has(cnpj)) continue;
    seen.add(cnpj);
    const [legalNatureCode = null, legalNature = null] = legalNatures[cnpj.slice(0, 8)] ?? [];
    profile.legal_nature_code = legalNatureCode;
    profile.legal_nature = legalNature;
    audit(cnpj, profile);
    audit(cnpj, explanations);
    checkScores(cnpj, explanations);
    // A base não muda ao recarregar: o prazo sugerido para uma nova consulta não vale aqui.
    profile.provenance.retry_after_seconds = null;
    shard[cnpj] = { profile, explanations, evolution: evolutionOf(cnpj, profile, explanations) };
    const scoreOf = (ods) => profile.ods_scores.find((item) => item.ods_number === ods);
    const companyFact = companyFacts(profile);
    facts.set(cnpj, packFacts(companyFact));
    analyticsCompanies.push({
      registrationStatus: profile.registration_status,
      uf: profile.address.uf ?? '',
      scores: ODS.map((ods) => ({ ods, ...scoreOf(ods) })),
      facts: companyFact,
    });

    const movement = companyMovementOf({ profile, explanations }, NOW);

    if (movement) {
      checkMovement(movement);
      movements.push(movement);
    }

    for (const group of profile.evidences) evidences += group.evidences.length;
    if (scoreOf(13)?.score_value != null) coverage.com_indice_13 += 1;
    if (scoreOf(15)?.score_value != null) coverage.com_indice_15 += 1;
    for (const source of Object.values(explanations)) {
      if (source.calculated_at > capturedAt) capturedAt = source.calculated_at;
    }

    const cnae = (item) => cnaes.of(item.code, [item.code, item.description]);
    rows.push([
      cnpj,
      profile.legal_name,
      profile.trade_name,
      statuses.of(profile.registration_status, profile.registration_status),
      places.of(`${profile.address.city}|${profile.address.uf}`, [
        profile.address.city ?? '',
        profile.address.uf ?? '',
      ]),
      cnae(profile.main_cnae),
      profile.secondary_cnaes.map(cnae),
      ...ODS.flatMap((ods) => [
        scoreOf(ods)?.score_value ?? null,
        scoreOf(ods)?.confidence_value ?? null,
      ]),
    ]);
  }
  const packed = gz(shard);
  biggest = Math.max(biggest, packed.length);
  writeFileSync(join(OUT, 'companies', `${file.slice(0, 3)}.json.gz`), packed);
}

if (problems.count) {
  console.error(problems.join('\n'));
  throw new Error(`${problems.count} problema(s) na base: nada deve ser publicado.`);
}

rows.sort((a, b) => (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0));
const search = gz({
  statuses: statuses.values,
  places: places.values,
  cnaes: cnaes.values,
  ods: ODS,
  rows,
});
writeFileSync(join(OUT, 'search.json.gz'), search);

const analytics = gz({
  sizes: sizes.values,
  natures: natures.values,
  biomes: categories.biomes.values,
  infractionTypes: categories.infractionTypes.values,
  sanctions: categories.sanctions.values,
  rows: rows.map(([cnpj]) => facts.get(cnpj)),
});
writeFileSync(join(OUT, 'analytics.json.gz'), analytics);

const sectors = JSON.parse(readFileSync(join(dump, 'sectors.json'), 'utf8'));
writeFileSync(join(OUT, 'sectors.json.gz'), gz(sectors));

const sectorNames = new Map(
  sectors.sectors.data.map((item) => [item.cnae_division, item.description]),
);
writeFileSync(
  join(OUT, 'analytics-base.json.gz'),
  gz(summarizeCompanies(analyticsCompanies, ODS, (code) => sectorNames.get(code) ?? code)),
);

const sortedMovements = movements.sort(byMostRecentMovement);
const publishedMovements = sortedMovements.filter(
  (item, index) =>
    index < PUBLISHED_MOVEMENTS_LIMIT ||
    item.ods.some(({ movement }) => movement?.evidence_category === 'EMISSAO_GEE'),
);
const movementList = gz(publishedMovements);
writeFileSync(join(OUT, 'movements.json.gz'), movementList);

const size = (dir) =>
  readdirSync(dir).reduce((total, name) => {
    const path = join(dir, name);
    return total + (statSync(path).isDirectory() ? size(path) : statSync(path).size);
  }, 0);

const manifest = {
  captured_at: capturedAt,
  companies: rows.length,
  evidences,
  ...coverage,
  sectors: sectors.sectors.data.length,
  movements: publishedMovements.length,
};
writeFileSync(join(OUT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(manifest);
console.log(
  `movimentações ${movements.length}; lista ${(movementList.length / 1e6).toFixed(2)} MB`,
);
console.log(
  `índice ${(search.length / 1e6).toFixed(1)} MB; maior fatia ${(biggest / 1e6).toFixed(2)} MB; total ${(size(OUT) / 1e6).toFixed(1)} MB`,
);
