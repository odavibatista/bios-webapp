import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { ApiCredentials } from '../../core/api/api-credentials';
import seedKeyCreation from '../../core/mocks/fixtures/createApiKey/sucesso';
import { MockBiosApi } from '../../core/mocks/mock-bios-api';
import {
  createPresentationFetch,
  operationRoutes,
  type OpenApiDocument,
  type OperationHandlers,
} from './presentation-fetch';
import { BIOS_SCALAR_THEME } from './scalar-theme';

/** O documento OpenAPI do `bios-core-api`, copiado de `api/openapi.json` no build. */
export const OPENAPI_DOCUMENT_URL = 'openapi/openapi.json';
/** Folha de estilos do Scalar, gerada à parte no build e carregada só nesta página. */
export const SCALAR_STYLESHEET_URL = 'scalar-api-reference.css';
/** Caminho anunciado como servidor: o que começa por ele é respondido no navegador. */
export const PRESENTATION_API_PATH = '/api';
/** Classe do `<main>` enquanto a página existe: a referência ocupa a largura toda da tela. */
export const FULL_WIDTH_CLASS = 'full-width';

/**
 * A apresentação da referência, só no app: entra depois da descrição do documento, que segue
 * igual à da API. A chave citada é a já cadastrada na conta de demonstração, com o segredo da
 * criação capturada na API. O link para Chaves de API navega pelo próprio app.
 */
export function presentationDescription(
  apiDescription: unknown,
  seedKey: string = seedKeyCreation.body.key,
): string {
  return [
    typeof apiDescription === 'string' ? apiDescription : '',
    'A referência completa da API do BIOS: rotas, parâmetros, schemas, autenticação e exemplos ' +
      'de código em várias linguagens. Na versão de apresentação, o botão de testar envia a ' +
      'requisição a uma reprodução da API no navegador, com respostas reais capturadas. As rotas ' +
      'privadas usam o token de quem entrou, e a API pública (`/v1`) aceita a chave já ' +
      `cadastrada, \`${seedKey}\`, ou uma gerada em [Chaves de API](/conta/chaves).`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

type State = 'loading' | 'ready' | 'failed';

/**
 * Referência da API (RF17) com o Scalar, sem depender da API no ar: o documento OpenAPI vem do
 * próprio app, e as requisições de teste são respondidas pelo mock da versão de apresentação,
 * com as respostas reais capturadas. Rotas, schemas, exemplos de código por linguagem, a
 * autenticação e o envio de requisições funcionam como na referência publicada pela API.
 */
@Component({
  selector: 'bios-api-reference-page',
  templateUrl: './api-reference-page.html',
  styleUrl: './api-reference-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiReferencePage {
  private readonly document = inject(DOCUMENT);
  private readonly api = inject(MockBiosApi);
  private readonly credentials = inject(ApiCredentials);
  private readonly router = inject(Router);
  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  protected readonly state = signal<State>('loading');

  private destroyed = false;
  private readonly cleanups: (() => void)[] = [];

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      for (const cleanup of this.cleanups.splice(0)) cleanup();
    });
    afterNextRender(() => {
      this.cleanups.push(this.fullWidth(), this.followAppLinks());
      void this.mount();
    });
  }

  /** O `<main>` do app deixa a largura máxima e as margens enquanto a referência está aberta. */
  private fullWidth(): () => void {
    const main = this.document.querySelector('main');

    main?.classList.add(FULL_WIDTH_CLASS);

    return () => main?.classList.remove(FULL_WIDTH_CLASS);
  }

  /** Links do próprio app dentro da referência (`/conta/chaves`) navegam sem recarregar. */
  private followAppLinks(): () => void {
    const host = this.host().nativeElement;
    const listener = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[href^="/"]');
      const href = link?.getAttribute('href');

      if (!href || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey) return;
      event.preventDefault();
      void this.router.navigateByUrl(href);
    };

    host.addEventListener('click', listener);

    return () => host.removeEventListener('click', listener);
  }

  private async mount(): Promise<void> {
    const doc = this.document;
    const view = doc.defaultView!;

    try {
      this.cleanups.push(this.stylesheet());
      const [{ createApiReference }, spec, apiKey] = await Promise.all([
        import('@scalar/api-reference'),
        view.fetch(OPENAPI_DOCUMENT_URL).then((response) => {
          if (!response.ok) throw new Error(`OpenAPI: ${response.status}`);

          return response.json() as Promise<OpenApiDocument & Record<string, unknown>>;
        }),
        this.api.activeApiKeyValue(),
      ]);

      if (this.destroyed) return;

      const baseUrl = view.location.origin + PRESENTATION_API_PATH;
      const token = this.credentials.accessToken();
      const reference = createApiReference(this.host().nativeElement, {
        content: {
          ...spec,
          info: {
            ...(spec['info'] as Record<string, unknown>),
            description: presentationDescription(
              (spec['info'] as { description?: unknown })?.description,
            ),
          },
          servers: [
            {
              url: baseUrl,
              description: 'Versão de apresentação: respostas reais da API, servidas no navegador',
            },
          ],
        },
        customFetch: createPresentationFetch({
          baseUrl,
          routes: operationRoutes(spec),
          handlers: this.api as unknown as OperationHandlers,
          withAccessToken: (requestToken, call) => this.api.withAccessToken(requestToken, call),
          now: () => Date.now(),
          fallback: (input, init) => view.fetch(input, init),
        }),
        localization: { locale: 'pt' },
        theme: 'none',
        customCss: BIOS_SCALAR_THEME,
        withDefaultFonts: false,
        forceDarkModeState: 'light',
        hideDarkModeToggle: true,
        // Nada sai do navegador: sem telemetria, sem assistente de IA e sem servidor MCP.
        telemetry: false,
        showDeveloperTools: 'never',
        agent: { disabled: true },
        mcp: { disabled: true },
        persistAuth: false,
        documentDownloadType: 'both',
        defaultHttpClient: { targetKey: 'js', clientKey: 'fetch' },
        // Quem entrou pela demonstração já tem um token, e a rota pública já vem com a chave
        // ativa mais recente da conta: as duas respondem de primeira. Sem esquema preferido, cada
        // rota usa o que o OpenAPI declara para ela (jwt nas privadas, a chave na pública).
        authentication: {
          securitySchemes: {
            ...(token ? { jwt: { token } } : {}),
            ...(apiKey ? { 'api-key': { value: apiKey } } : {}),
          },
        },
      });

      this.cleanups.push(() => reference.destroy());
      this.cleanups.push(this.followHeaderHeight());
      this.state.set('ready');
    } catch {
      if (!this.destroyed) this.state.set('failed');
    }
  }

  /** Liga a folha de estilos do Scalar enquanto a página existe: ela não vaza para as outras. */
  private stylesheet(): () => void {
    const link = this.document.createElement('link');

    link.rel = 'stylesheet';
    link.href = SCALAR_STYLESHEET_URL;
    link.dataset['biosApiReference'] = '';
    this.document.head.appendChild(link);

    return () => link.remove();
  }

  /**
   * A barra lateral e os títulos fixos do Scalar descontam a altura do cabeçalho do BIOS, que
   * muda com a largura (busca em segunda linha no celular) e com a faixa da barra de status.
   */
  private followHeaderHeight(): () => void {
    const header = this.document.querySelector<HTMLElement>('[role="banner"]');
    const host = this.host().nativeElement;

    if (!header || typeof ResizeObserver === 'undefined') return () => undefined;

    const update = () => {
      const sticky = getComputedStyle(header).position === 'sticky';

      host.style.setProperty(
        '--scalar-custom-header-height',
        sticky ? `${header.offsetHeight}px` : '0px',
      );
    };
    const observer = new ResizeObserver(update);

    observer.observe(header);
    update();

    return () => observer.disconnect();
  }
}
