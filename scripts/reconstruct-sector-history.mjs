// Reconstrói a série mensal dos setores a partir das datas reais das evidências.
//
// Uso: node scripts/reconstruct-sector-history.mjs <pasta do dump> <bios-core-api> [meses]
//
// A API só guarda o agregado do mês em que o job rodou, então uma base nova nasce com um mês. Aqui,
// cada mês passado é recalculado com as regras da própria API (`scoreOdsEvidences`, importada do
// código dela, e não copiada), usando só o que existia no fim daquele mês. Nada é inventado, mas a
// série é uma reconstrução: registros que a fonte já retirou não entram.
//
// Antes de gravar, o script reproduz o índice atual de cada empresa e a média de cada setor. Se a
// regra não reproduzir o que a API calculou, nada é publicado.
//
// Os arquivos de `public/presentation` são servidos como imutáveis por um ano: quem regravar um deles
// precisa publicar a base numa pasta de versão nova, ou quem já visitou o site continua com o antigo.
import { createReadStream, existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import { loadCoreRules, storedEvidences } from './core-rules.mjs';

const [dump, core, months = '24'] = process.argv.slice(2);
if (!dump || !core) throw new Error('Informe a pasta do dump e a do bios-core-api.');

const WINDOWS = Number(months);
const ODS = [13, 15];
const MINIMUM_COMPANIES = 5;
const MAX_MISMATCH = 0.001;
const FAR_FUTURE = new Date('2100-01-01T00:00:00.000Z');

/**
 * A empresa como estava em `at`. Registro posterior some, e a fonte que ficou sem nenhum passa a
 * ser uma consulta sem registro; embargo baixado depois de `at` ainda valia inteiro. As coletas
 * não vencem aqui: a validade é de hoje, e não diz nada sobre o passado.
 */
function asOf(evidences, at) {
  const kept = [];
  const emptied = new Map();

  for (const evidence of evidences) {
    if (evidence.state !== 'CONFIRMED') {
      kept.push({ ...evidence, validUntil: FAR_FUTURE });
    } else if (evidence.factDate && evidence.factDate <= at) {
      const { details } = evidence;
      const liftedLater =
        details?.lifted === true && details.lifted_at && new Date(details.lifted_at) > at;

      kept.push({
        ...evidence,
        validUntil: FAR_FUTURE,
        details: liftedLater ? { ...details, lifted: false } : details,
      });
    } else {
      emptied.set(evidence.sourceSlug, evidence);
    }
  }
  for (const [slug, evidence] of emptied) {
    if (!kept.some((item) => item.sourceSlug === slug && item.state === 'CONFIRMED')) {
      kept.push({
        ...evidence,
        id: `${slug}-sem-registro`,
        state: 'NOT_FOUND',
        validUntil: FAR_FUTURE,
      });
    }
  }

  return kept;
}

const { scoreOdsEvidences, withMinimumSample } = await loadCoreRules(core, 'sector-rules', {
  'scoring/domain/ods-score-rules.js': ['scoreOdsEvidences'],
  'scoring/domain/sector-evolution.js': ['withMinimumSample'],
});

const original = join(dump, 'sectors.api.json');
const current = join(dump, 'sectors.json');
if (!existsSync(original)) writeFileSync(original, readFileSync(current));
const published = JSON.parse(readFileSync(original, 'utf8'));

const lastStart = Object.values(published.evolutions)
  .flatMap(({ windows }) => windows.map(({ window_start: start }) => start))
  .sort()
  .at(-1);
const last = new Date(lastStart);
const windows = Array.from({ length: WINDOWS }, (_, index) => {
  const offset = index - WINDOWS + 1;

  return {
    start: new Date(Date.UTC(last.getUTCFullYear(), last.getUTCMonth() + offset, 1)),
    end: new Date(Date.UTC(last.getUTCFullYear(), last.getUTCMonth() + offset + 1, 1)),
  };
});

const totals = new Map();
const add = (division, ods, slot, score, confidence) => {
  const key = `${division}-${ods}`;
  let series = totals.get(key);

  if (!series) {
    series = windows.map(() => ({ companies: 0, scored: 0, score: 0, confidence: 0 }));
    totals.set(key, series);
  }
  const bucket = series[slot];

  bucket.companies += 1;
  bucket.confidence += confidence;
  if (score !== null) {
    bucket.scored += 1;
    bucket.score += score;
  }
};

const check = { companies: 0, compared: 0, different: 0, examples: [] };
const seen = new Set();

for (const file of readdirSync(dump)
  .filter((name) => /^\w{3}\.jsonl$/.test(name))
  .sort()) {
  for await (const line of createInterface({ input: createReadStream(join(dump, file), 'utf8') })) {
    if (!line) continue;
    const { cnpj, profile, explanations } = JSON.parse(line);

    if (seen.has(cnpj)) continue;
    seen.add(cnpj);
    check.companies += 1;

    const evidences = storedEvidences(cnpj, profile);
    const division = profile.main_cnae.code.slice(0, 2);

    for (const ods of ODS) {
      const own = evidences.filter((evidence) => evidence.odsNumber === ods);
      const score = profile.ods_scores.find((item) => item.ods_number === ods);

      if (score?.score_value !== undefined && explanations[ods]) {
        const at = new Date(explanations[ods].calculated_at);
        const again = scoreOdsEvidences(ods, own, at).scoreValue;

        check.compared += 1;
        if (again !== score.score_value) {
          check.different += 1;
          if (check.examples.length < 5) {
            check.examples.push(`${cnpj} ODS ${ods}: API ${score.score_value}, regra ${again}`);
          }
        }
      }
      windows.forEach(({ end }, slot) => {
        const at = new Date(end.getTime() - 1);
        const past = asOf(own, at);
        const hasConfirmed = past.some(({ state }) => state === 'CONFIRMED');
        const { scoreValue, confidenceValue } = hasConfirmed
          ? scoreOdsEvidences(ods, past, at)
          : { scoreValue: null, confidenceValue: 0 };

        add(division, ods, slot, scoreValue, confidenceValue);
      });
    }
  }
}

const rate = check.different / check.compared;
console.log(
  `empresas ${check.companies}; índices reproduzidos ${check.compared - check.different} de ${check.compared}`,
);
check.examples.forEach((example) => console.log('  ', example));
if (rate > MAX_MISMATCH)
  throw new Error(`Regra não reproduz a API em ${(rate * 100).toFixed(2)}%.`);

const rulesVersion = Object.values(published.evolutions)[0].windows[0].rules_version;
const evolutions = {};
let gaps = 0;
let worst = 0;

for (const [key, source] of Object.entries(published.evolutions)) {
  const series = totals.get(key);
  const real = source.windows.at(-1);
  const built = windows.map(({ start, end }, slot) => {
    const { companies, scored, score, confidence } = series?.[slot] ?? {
      companies: 0,
      scored: 0,
      score: 0,
      confidence: 0,
    };
    const shown = withMinimumSample(
      {
        companyCount: companies,
        scoredCompanyCount: scored,
        averageScore: scored ? score / scored : null,
        averageConfidence: companies ? confidence / companies : null,
      },
      MINIMUM_COMPANIES,
    );

    if (shown.averageScore === null) gaps += 1;

    return {
      window_start: start.toISOString(),
      window_end: end.toISOString(),
      average_score: shown.averageScore,
      average_confidence: shown.averageConfidence,
      company_count: companies,
      scored_company_count: scored,
      rules_version: rulesVersion,
    };
  });
  const final = built.at(-1);

  // O mês atual é o que a API agregou de verdade; a reconstrução dele serve de prova.
  if (real.average_score !== null && final.average_score !== null) {
    worst = Math.max(worst, Math.abs(real.average_score - final.average_score));
  }
  built[built.length - 1] = real;
  evolutions[key] = { ...source, history_status: 'AVAILABLE', windows: built };
}

console.log(`maior diferença na média do mês atual: ${worst.toFixed(4)}; meses sem média: ${gaps}`);
if (worst > 0.5) throw new Error('A reconstrução não reproduz a média real do mês atual.');

writeFileSync(current, JSON.stringify({ sectors: published.sectors, evolutions }));
console.log(`${Object.keys(evolutions).length} séries com ${WINDOWS} meses em ${current}`);
