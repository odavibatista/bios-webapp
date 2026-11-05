import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BiosApi } from '../../core/api/bios-api';
import { SessionStore } from '../../core/session/session-store';
import { PRESENTATION_MODE } from '../../core/presentation-mode';
import { AsyncState } from '../../shared/states/async-state';
import { CnpjSearch } from '../profile/cnpj-search/cnpj-search';
import { MovementCard } from './movement-card/movement-card';

interface Shortcut {
  title: string;
  description: string;
  icon: string;
  path: string;
}

/** Empresas por página da lista (UC18, regra 3). */
export const MOVEMENTS_PAGE_SIZE = 20;

export const NO_MOVEMENTS_MESSAGE =
  'Ainda não há movimentações registradas. Elas aparecem aqui quando o índice de uma empresa mudar.';

export const PAGE_WITHOUT_MOVEMENTS_MESSAGE = 'Esta página não tem movimentações.';

/** Os caminhos de entrada da análise, oferecidos enquanto não há movimentações (UC18, 2.1). */
export const PANEL_SHORTCUTS: readonly Shortcut[] = [
  {
    title: 'Consultar uma empresa',
    description: 'Pelo CNPJ: índice de aderência, confiança e as evidências de cada ODS.',
    icon: 'domain',
    path: '/empresas',
  },
  {
    title: 'Pesquisar empresas',
    description: 'Por nome, setor ou UF, com ordenação pelo índice e exportação em planilha.',
    icon: 'manage_search',
    path: '/pesquisa',
  },
  {
    title: 'Comparar setores',
    description: 'A média do índice por setor econômico e a evolução ao longo do tempo.',
    icon: 'monitoring',
    path: '/setores',
  },
];

function pageFrom(value: string | undefined): number {
  const page = Number(value);

  return Number.isInteger(page) && page >= 1 ? page : 1;
}

/**
 * Tela principal (UC18, RF34; #168): para onde o login leva. Mostra a busca e as empresas cujo
 * índice mudou por último. A página mora na URL, para o "voltar" do navegador devolver a pessoa
 * à mesma página depois de abrir um perfil. Falha na lista não atrapalha a busca (UC18, 2.2).
 */
@Component({
  selector: 'bios-panel-home',
  imports: [
    AsyncState,
    CnpjSearch,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MovementCard,
    RouterLink,
  ],
  templateUrl: './panel-home.html',
  styleUrl: './panel-home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelHome {
  private readonly api = inject(BiosApi);
  private readonly store = inject(SessionStore);
  private readonly presentation = inject(PRESENTATION_MODE);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** A página da URL (`?pagina=2`), já que o app liga parâmetros de rota aos inputs. */
  readonly pagina = input<string>();

  protected readonly shortcuts = PANEL_SHORTCUTS;

  protected readonly greeting = computed(() =>
    this.presentation ? 'Olá!' : `Olá, ${this.store.user()?.name.split(' ')[0] ?? ''}`,
  );

  protected readonly movements = resource({
    params: () => pageFrom(this.pagina()),
    loader: ({ params: page }) =>
      this.api.listCompanyMovements({ query: { page, page_size: MOVEMENTS_PAGE_SIZE } }),
  });

  protected readonly items = computed(() =>
    this.movements.hasValue() ? this.movements.value().data : [],
  );

  protected readonly pagination = computed(() =>
    this.movements.hasValue() ? this.movements.value().pagination : null,
  );

  protected readonly emptyMessage = computed(() =>
    this.pagination()?.total ? PAGE_WITHOUT_MOVEMENTS_MESSAGE : NO_MOVEMENTS_MESSAGE,
  );

  protected async goToPage(page: number): Promise<void> {
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: page > 1 ? { pagina: page } : {},
    });
  }
}
