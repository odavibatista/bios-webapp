// Roda `ng test` (uma vez, salvo com --watch) repassando os argumentos.
//
// Contorno: o builder de testes do Angular entrega ao Vitest o caminho absoluto de cada spec como
// padrão de busca, sem escapar. Com parênteses ou colchetes no caminho (ex.: `7-SEM (2026-2)`), o
// padrão vira grupo de glob e o Vitest responde "No test files found". No Windows, nesse caso, a
// pasta que contém o projeto é montada numa unidade temporária (`subst`) e os testes rodam de
// `<unidade>:\<projeto>` (na raiz da unidade o builder monta um caminho inválido); a unidade é
// desmontada no fim. Fora disso (CI, outros caminhos), roda direto. Apagar quando o Angular escapar
// o caminho.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const ng = fileURLToPath(new URL('../node_modules/@angular/cli/bin/ng.js', import.meta.url));
const args = process.argv.slice(2);
const testArgs = args.some((arg) => arg.startsWith('--watch')) ? args : ['--watch=false', ...args];

const GLOB_CHARACTERS = /[()[\]{}*?!]/;

function run(cwd) {
  const result = spawnSync(process.execPath, [ng, 'test', ...testArgs], { cwd, stdio: 'inherit' });
  return result.status ?? 1;
}

function freeDriveLetter() {
  return [...'ZYXWVUTSRQPONMLKJIHG'].find((letter) => !existsSync(`${letter}:\\`));
}

if (process.platform !== 'win32' || !GLOB_CHARACTERS.test(root)) {
  process.exit(run(root));
}

const letter = freeDriveLetter();
if (!letter) {
  console.error('Nenhuma letra de unidade livre para contornar os parênteses do caminho.');
  process.exit(1);
}

const drive = `${letter}:`;
const unmount = () => {
  try {
    execFileSync('subst', [drive, '/D'], { stdio: 'ignore' });
  } catch {
    // já desmontada
  }
};

execFileSync('subst', [drive, dirname(root)]);
process.on('SIGINT', () => {
  unmount();
  process.exit(130);
});

let status = 1;
try {
  status = run(`${drive}\\${basename(root)}`);
} finally {
  unmount();
}
process.exit(status);
