// Grava o catálogo de UFs e municípios na base publicada, a partir do que o bios-core-api versiona.
// Uso: node scripts/build-locations-data.mjs <bios-core-api>
//
// O arquivo vai para a pasta da base, com nome próprio: os demais não mudam, e quem já os tem em
// cache não precisa baixar nada de novo.
import { writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { gzip } from 'node:zlib';
import { loadCoreRules } from './core-rules.mjs';

const VERSION = 'v5';
const [core] = process.argv.slice(2);

if (!core) throw new Error('Uso: node scripts/build-locations-data.mjs <bios-core-api>');

const { IBGE_CITIES, IBGE_STATES, CITY_ALIASES } = await loadCoreRules(core, 'locations', {
  'locations/infra/db/seeders/ibge-locations.data.js': ['IBGE_CITIES', 'IBGE_STATES'],
  'locations/infra/db/seeders/city-aliases.data.js': ['CITY_ALIASES'],
});

const rows = {
  states: IBGE_STATES.map(({ id, acronym, name }) => [id, acronym, name]),
  cities: IBGE_CITIES.map(([id, name, stateId]) =>
    CITY_ALIASES[id] ? [id, name, stateId, CITY_ALIASES[id]] : [id, name, stateId],
  ),
};
const output = `public/presentation/${VERSION}/locations.json.gz`;
const file = await promisify(gzip)(JSON.stringify(rows), { level: 9 });

await writeFile(output, file);
console.log(`${rows.states.length} UFs e ${rows.cities.length} municípios em ${output}.`);
