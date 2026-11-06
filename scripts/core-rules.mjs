// Regras do índice lidas do bios-core-api, para os scripts da base usarem o código da API, e não
// uma cópia dele. Os enums do Prisma entram só como textos.
import { delimiter, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

/** Empacota os módulos pedidos: `{ arquivo de @modules: [nomes exportados] }`. */
export async function loadCoreRules(core, name, exports) {
  const modules = join(resolve(core), 'src/modules').replaceAll('\\', '/');
  const outfile = fileURLToPath(new URL(`../dist/${name}.mjs`, import.meta.url));
  const contents = Object.entries(exports)
    .map(([file, names]) => `export { ${names.join(', ')} } from '@modules/${file}';`)
    .join('\n');

  await build({
    stdin: { contents, resolveDir: resolve(core), loader: 'ts' },
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile,
    logLevel: 'error',
    // `NODE_PATH` cobre um checkout do bios-core-api sem `node_modules`.
    nodePaths: [
      join(resolve(core), 'node_modules'),
      ...(process.env.NODE_PATH?.split(delimiter).filter(Boolean) ?? []),
    ],
    plugins: [
      {
        name: 'regras-da-api',
        setup(context) {
          context.onResolve({ filter: /^@prisma\/client$/ }, () => ({
            path: 'prisma-enums',
            namespace: 'enums',
          }));
          context.onLoad({ filter: /.*/, namespace: 'enums' }, () => ({
            contents: `const text = (...names) => Object.fromEntries(names.map((name) => [name, name]));
              export const EvidenceCategory = text('INFRACAO_AMBIENTAL', 'CONDUTA_ADMINISTRATIVA', 'EMISSAO_GEE');
              export const EvidenceSignal = text('POSITIVE', 'NEGATIVE');
              export const EvidenceState = text('CONFIRMED', 'NOT_FOUND', 'UNKNOWN', 'OUTDATED');
              export const ScoreMovementCause = text('EVIDENCE_ADDED', 'EVIDENCE_REMOVED', 'WEIGHT_CHANGED');
              export const ScoreMovementDirection = text('INCREASED', 'DECREASED', 'AVAILABLE', 'UNAVAILABLE');`,
          }));
          context.onResolve({ filter: /^@modules\// }, (args) => ({
            path: `${modules}/${args.path.slice('@modules/'.length).replace(/\.js$/, '.ts')}`,
          }));
          context.onResolve({ filter: /^\.\.?\/.*\.js$/ }, (args) =>
            args.resolveDir.includes('node_modules')
              ? undefined
              : { path: resolve(args.resolveDir, args.path.replace(/\.js$/, '.ts')) },
          );
        },
      },
    ],
  });

  return import(pathToFileURL(outfile).href);
}

/** Quando o fato aconteceu: a regra da movimentação (UC15, regra 8), nunca a data de coleta. */
function factDate({ published_at: published, details }) {
  if (published) return new Date(published);
  if (typeof details?.startDate === 'string' && !Number.isNaN(Date.parse(details.startDate))) {
    return new Date(details.startDate);
  }

  return typeof details?.inventoryYear === 'number'
    ? new Date(Date.UTC(details.inventoryYear, 11, 31))
    : null;
}

/** As evidências de um perfil como a API as guarda. */
export function storedEvidences(cnpj, profile) {
  return profile.evidences.flatMap(({ category, evidences }) =>
    evidences.map((evidence) => ({
      id: evidence.id,
      key: `${evidence.source_slug}:${cnpj}:${evidence.source_reference ?? evidence.state}`,
      cnpj,
      sourceSlug: evidence.source_slug,
      sourceName: evidence.source,
      category,
      odsNumber: evidence.ods_number,
      state: evidence.state,
      signal: evidence.signal,
      summary: evidence.summary,
      sourceReference: evidence.source_reference,
      sourceUrl: evidence.source_url,
      details: evidence.details,
      publishedAt: evidence.published_at ? new Date(evidence.published_at) : null,
      collectedAt: new Date(evidence.collected_at),
      validUntil: new Date(evidence.valid_until),
      factDate: factDate(evidence),
    })),
  );
}
