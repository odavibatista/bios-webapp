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
import { RouterLink } from '@angular/router';
import { ApiCredentials } from '../../core/api/api-credentials';
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

type State = 'loading' | 'ready' | 'failed';

/**
 * Referência da API (RF17) com o Scalar, sem depender da API no ar: o documento OpenAPI vem do
 * próprio app, e as requisições de teste são respondidas pelo mock da versão de apresentação,
 * com as respostas reais capturadas. Rotas, schemas, exemplos de código por linguagem, a
 * autenticação e o envio de requisições funcionam como na referência publicada pela API.
 */
@Component({
  selector: 'bios-api-reference-page',
  imports: [RouterLink],
  templateUrl: './api-reference-page.html',
  styleUrl: './api-reference-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiReferencePage {
  private readonly document = inject(DOCUMENT);
  private readonly api = inject(MockBiosApi);
  private readonly credentials = inject(ApiCredentials);
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
      void this.mount();
    });
  }

  private async mount(): Promise<void> {
    const doc = this.document;
    const view = doc.defaultView!;

    try {
      this.cleanups.push(this.stylesheet());
      const [{ createApiReference }, spec] = await Promise.all([
        import('@scalar/api-reference'),
        view.fetch(OPENAPI_DOCUMENT_URL).then((response) => {
          if (!response.ok) throw new Error(`OpenAPI: ${response.status}`);

          return response.json() as Promise<OpenApiDocument & Record<string, unknown>>;
        }),
      ]);

      if (this.destroyed) return;

      const baseUrl = view.location.origin + PRESENTATION_API_PATH;
      const token = this.credentials.accessToken();
      const reference = createApiReference(this.host().nativeElement, {
        content: {
          ...spec,
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
        // Quem entrou pela demonstração já tem um token: as rotas privadas respondem de primeira.
        ...(token
          ? {
              authentication: {
                preferredSecurityScheme: 'jwt',
                securitySchemes: { jwt: { token } },
              },
            }
          : {}),
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
