/// <reference types="node" />
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const APP = join(process.cwd(), 'src/app');
const ICONS: string[] = JSON.parse(
  readFileSync(join(process.cwd(), 'src/styles/icons.json'), 'utf8'),
) as string[];

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);

    if (statSync(path).isDirectory()) return name === 'generated' ? [] : sources(path);

    return /\.(ts|html)$/.test(name) && !name.endsWith('.spec.ts') ? [path] : [];
  });
}

/** Ícones citados no código: no conteúdo de `mat-icon`, em `icon: '...'` e em `icon="..."`. */
function usedIcons(text: string): string[] {
  const found = new Set<string>();

  for (const [, content] of text.matchAll(/<mat-icon[^>]*>([\s\S]*?)<\/mat-icon/g)) {
    const quoted = [...content.matchAll(/'([a-z_0-9]+)'/g)].map(([, name]) => name);
    const literal = /^\s*([a-z_0-9]+)\s*$/.exec(content)?.[1];

    [...quoted, ...(literal ? [literal] : [])].forEach((name) => found.add(name));
  }
  for (const [, name] of text.matchAll(/\bicon(?::|=| = input\()\s*["']([a-z_0-9]+)["']/g)) {
    found.add(name);
  }
  for (const [, name] of text.matchAll(/\? '([a-z_0-9]+)' : '[a-z_0-9]+',?\s*\n?\s*\);/g)) {
    found.add(name);
  }

  return [...found];
}

describe('fonte de ícones', () => {
  it('traz todo ícone que o app usa: sem ele, o nome apareceria como texto na tela', () => {
    const used = sources(APP).flatMap((file) => usedIcons(readFileSync(file, 'utf8')));

    expect(used.length).toBeGreaterThan(15);
    expect([...new Set(used)].filter((name) => !ICONS.includes(name))).toEqual([]);
  });
});
