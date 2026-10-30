/// <reference types="node" />
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Trava da acentuação dos textos pt-BR do webapp (NFIN04 a, #10): o que a pessoa lê na tela
 * está em português do Brasil, com acento, til e cedilha.
 *
 * Varre o texto visível dos templates e os literais de texto do código e reprova a grafia
 * **sem acento** de palavras que, em português, levam acento (`invalido`, `nao`, `indice`...).
 * Só entram na lista grafias que não são palavra válida sem o acento: `valida`, `esta` e
 * `media` ficam de fora de propósito. A lista parte da mesma trava do bios-core-api, com as
 * palavras próprias das telas.
 *
 * Alcance: nos templates, o texto entre as tags e os atributos lidos pela pessoa ou pelo leitor
 * de tela (`aria-label`, `title`, `alt`, `placeholder`...); nos `.ts`, os literais com espaço
 * (frases). Ficam de fora comentários, interpolações e bindings (são código), classes CSS,
 * URLs, specs, tipos gerados e as respostas capturadas da API (texto da própria API, que tem a
 * sua trava). Ao achar uma palavra nova sem acento, acrescente a grafia errada a `UNACCENTED`.
 */
const UNACCENTED = new Set([
  // Mesma lista do bios-core-api.
  'nao',
  'indice',
  'indices',
  'invalido',
  'invalidos',
  'invalidas',
  'numero',
  'numeros',
  'inventario',
  'inventarios',
  'emissoes',
  'emissao',
  'evidencia',
  'evidencias',
  'informacao',
  'informacoes',
  'validacao',
  'autorizacao',
  'autenticacao',
  'sessao',
  'sessoes',
  'codigo',
  'codigos',
  'orgao',
  'orgaos',
  'acao',
  'acoes',
  'tambem',
  'ultimo',
  'ultima',
  'ultimos',
  'ultimas',
  'periodo',
  'usuario',
  'usuarios',
  'endereco',
  'dominio',
  'dominios',
  'conteudo',
  'requisicao',
  'requisicoes',
  'excecao',
  'excecoes',
  'configuracao',
  'configuracoes',
  'obrigatorio',
  'obrigatoria',
  'obrigatorios',
  'minimo',
  'maximo',
  'publico',
  'publicos',
  'publicas',
  'proximo',
  'proxima',
  'nivel',
  'niveis',
  'pagina',
  'paginas',
  'voce',
  'disponivel',
  'indisponivel',
  'disponiveis',
  'indisponiveis',
  'sustentavel',
  'sustentaveis',
  'aderencia',
  'referencia',
  'referencias',
  'decisao',
  'situacao',
  'conexao',
  'operacao',
  'operacoes',
  'execucao',
  'execucoes',
  'descricao',
  'descricoes',
  'inscricao',
  'identificacao',
  'exclusao',
  'criacao',
  'alteracao',
  'atualizacao',
  'publicacao',
  'ausencia',
  'presenca',
  'tecnica',
  'tecnico',
  'historico',
  'historica',
  'alem',
  'apos',
  'atraves',
  'permissao',
  'permissoes',
  'expiracao',
  'renovacao',
  'revogacao',
  'solicitacao',
  'confirmacao',
  'verificacao',
  'notificacao',
  'recuperacao',
  'redefinicao',
  'unico',
  'unicos',
  'diario',
  'diaria',
  'analise',
  'saude',
  'variavel',
  'variaveis',
  'possivel',
  'impossivel',
  'responsavel',
  'responsaveis',
  'valido',
  'validos',
  'validas',
  'vigencia',
  'infracao',
  'infracoes',
  'sancao',
  'sancoes',
  'punicao',
  'suspensao',
  'contribuicao',
  'contribuicoes',
  'pontuacao',
  'explicacao',
  'correspondencia',
  'ocorrencia',
  'ocorrencias',
  'gestao',
  'educacao',
  'regiao',
  'regioes',
  'organizacao',
  'organizacoes',
  'classificacao',
  'classificacoes',
  'transparencia',
  'fiscalizacao',
  'poluicao',
  'degradacao',
  'preservacao',
  'conservacao',
  'residuo',
  'residuos',
  'porem',
  'entao',
  'calculo',
  'calculos',
  'relatorio',
  'relatorios',
  'duvida',
  'duvidas',
  'seguranca',
  'servico',
  'servicos',
  'municipio',
  'municipios',
  'sequencia',
  'frequencia',
  'experiencia',
  'existencia',
  'pendencia',
  'dependencia',
  'tendencia',
  // Próprias das telas.
  'inicio',
  'navegacao',
  'apresentacao',
  'demonstracao',
  'exportacao',
  'evolucao',
  'confianca',
  'razao',
  'economica',
  'economico',
  'grafico',
  'graficos',
  'acessivel',
  'opcao',
  'opcoes',
  'atencao',
  'protecao',
  'aplicacao',
  'mes',
  'meses',
  'ja',
  'saida',
]);

/** Atributos que a pessoa lê, ou que o leitor de tela anuncia. */
const READABLE_ATTRIBUTES = new Set([
  'aria-label',
  'aria-description',
  'aria-placeholder',
  'aria-roledescription',
  'aria-valuetext',
  'title',
  'alt',
  'placeholder',
  'label',
]);

const ROOT = process.cwd();
const SOURCE_ROOT = join(ROOT, 'src');

/** Pastas que não são texto do webapp: tipos gerados e respostas capturadas da API. */
const SKIPPED_DIRECTORIES = /[\\/](generated|fixtures)$/;

function files(dir: string, extension: RegExp, found: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!SKIPPED_DIRECTORIES.test(path)) files(path, extension, found);
    } else if (extension.test(entry.name) && !entry.name.endsWith('.spec.ts')) {
      found.push(path);
    }
  }

  return found;
}

/**
 * Literais de texto de um arquivo TypeScript, sem comentários e sem o código das
 * interpolações dos templates (que pode conter outros literais, tratados à parte).
 *
 * Um tokenizador pequeno, e não uma expressão regular: templates aninhados (uma interpolação
 * com outro template dentro) desalinhariam qualquer regex de aspas.
 */
function textLiterals(source: string): string[] {
  const found: string[] = [];
  let index = 0;

  const quoted = (quote: string): string => {
    let text = '';

    index += 1;
    while (index < source.length && source[index] !== quote) {
      if (source[index] === '\\') index += 1;
      text += source[index] ?? '';
      index += 1;
    }
    index += 1;

    return text;
  };

  const template = (): string => {
    let text = '';

    index += 1;
    while (index < source.length && source[index] !== '`') {
      if (source[index] === '\\') {
        index += 2;
      } else if (source[index] === '$' && source[index + 1] === '{') {
        index += 2;
        code(true);
        text += ' ';
      } else {
        text += source[index];
        index += 1;
      }
    }
    index += 1;

    return text;
  };

  function code(untilClosingBrace: boolean): void {
    let depth = 0;

    while (index < source.length) {
      const char = source[index];
      const next = source[index + 1];

      if (char === '/' && next === '/') {
        while (index < source.length && source[index] !== '\n') index += 1;
      } else if (char === '/' && next === '*') {
        const close = source.indexOf('*/', index + 2);

        index = close < 0 ? source.length : close + 2;
      } else if (char === "'" || char === '"') {
        found.push(quoted(char));
      } else if (char === '`') {
        found.push(template());
      } else if (char === '{') {
        depth += 1;
        index += 1;
      } else if (char === '}') {
        index += 1;
        if (untilClosingBrace && depth === 0) return;
        depth -= 1;
      } else {
        index += 1;
      }
    }
  }

  code(false);

  return found;
}

/**
 * Texto que a pessoa lê num template Angular: o conteúdo entre as tags e os atributos
 * legíveis. Comentários, interpolações (`{{ }}`), blocos de controle (`@if (...)`) e
 * atributos com binding ficam de fora, porque são código.
 */
function readableText(template: string): string[] {
  const withoutCode = template
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/\{\{[\s\S]*?\}\}/g, ' ')
    .replace(/@\w+\s*(\([^)]*\))?/g, ' ');
  const found: string[] = [];

  const withoutTags = withoutCode.replace(/<[^>]*>/g, (tag) => {
    for (const [, name, value] of tag.matchAll(/([\w:.-]+)\s*=\s*"([^"]*)"/g)) {
      if (name && value !== undefined && READABLE_ATTRIBUTES.has(name.toLowerCase())) {
        found.push(value);
      }
    }

    return ' ';
  });

  found.push(withoutTags);

  return found;
}

function unaccentedIn(text: string): string[] {
  const words = (text.toLowerCase().match(/\p{L}+/gu) ?? []).filter((word) => UNACCENTED.has(word));

  return [...new Set(words)];
}

function report(path: string, texts: string[], phrasesOnly: boolean): string[] {
  const found: string[] = [];

  for (const content of texts) {
    const trimmed = content.trim();

    if (phrasesOnly && (!/\s/.test(trimmed) || /^https?:/.test(trimmed))) continue;

    const words = unaccentedIn(content.replace(/https?:\/\/\S+/g, ' '));

    if (words.length > 0) {
      found.push(
        `${relative(ROOT, path)}: [${words.join(', ')}] "${trimmed.replace(/\s+/g, ' ').slice(0, 80)}"`,
      );
    }
  }

  return found;
}

const typescriptFindings = (path: string, source: string) =>
  report(path, textLiterals(source), true);

const templateFindings = (path: string, source: string) =>
  report(path, readableText(source), false);

describe('acentuação dos textos pt-BR do webapp (NFIN04)', () => {
  it('nenhum template traz palavra sem acento', () => {
    const offenders = files(SOURCE_ROOT, /\.html$/).flatMap((path) =>
      templateFindings(path, readFileSync(path, 'utf8')),
    );

    expect(offenders).toEqual([]);
  });

  it('nenhum texto do código traz palavra sem acento', () => {
    const offenders = files(SOURCE_ROOT, /\.ts$/).flatMap((path) =>
      typescriptFindings(path, readFileSync(path, 'utf8')),
    );

    expect(offenders).toEqual([]);
  });

  it('varre os templates e o código do app, e não as pastas geradas', () => {
    const templates = files(SOURCE_ROOT, /\.html$/).map((path) => relative(ROOT, path));
    const code = files(SOURCE_ROOT, /\.ts$/).map((path) => relative(ROOT, path));

    expect(templates.length).toBeGreaterThan(0);
    expect(code.length).toBeGreaterThan(0);
    expect([...templates, ...code].filter((path) => /generated|fixtures/.test(path))).toEqual([]);
    expect(code.filter((path) => path.endsWith('.spec.ts'))).toEqual([]);
  });

  describe('o detector', () => {
    it('acusa texto sem acento num template e aceita o acentuado', () => {
      expect(templateFindings('x.html', '<p>Indice invalido</p>')).toHaveLength(1);
      expect(templateFindings('x.html', '<p>Índice inválido</p>')).toEqual([]);
    });

    it('lê os atributos legíveis e ignora classes, bindings, interpolações e comentários', () => {
      expect(templateFindings('x.html', '<a aria-label="Pagina inicial">Início</a>')).toHaveLength(
        1,
      );
      expect(
        templateFindings('x.html', '<img alt="Grafico da evolucao" src="x.png" />'),
      ).toHaveLength(1);
      expect(
        templateFindings(
          'x.html',
          [
            '<div class="indice-card pagina" [attr.aria-label]="rotuloDoIndice">',
            '  <!-- Pagina sem acento num comentário -->',
            '  @if (indice !== null) { {{ indice | number }} }',
            '  <a href="https://exemplo.gov.br/indice-de-fiscalizacao">Fonte oficial</a>',
            '</div>',
          ].join('\n'),
        ),
      ).toEqual([]);
    });

    it('acusa literal sem acento no código e aceita o acentuado', () => {
      expect(
        typescriptFindings('x.ts', "const a = 'CNPJ invalido para consultar evidencias.';"),
      ).toHaveLength(1);
      expect(
        typescriptFindings('x.ts', "const a = 'CNPJ inválido para consultar evidências.';"),
      ).toEqual([]);
    });

    it('entende template aninhado e ignora identificador, URL e comentário', () => {
      expect(
        typescriptFindings('x.ts', 'const a = `Mes ${cond ? `sem pontuacao` : ""} da empresa`;'),
      ).toHaveLength(2);
      expect(
        typescriptFindings(
          'x.ts',
          [
            'const indice = data.indice;',
            "const url = 'https://dados.example/fiscalizacao-auto-de-infracao';",
            "const rota = 'pesquisa';",
            '// Grafico sem acento: comentário, não é texto da tela.',
            '/* Evolucao em comentário de bloco */',
            'const msg = `Valor ${data.indice} recebido`;',
          ].join('\n'),
        ),
      ).toEqual([]);
    });
  });
});
