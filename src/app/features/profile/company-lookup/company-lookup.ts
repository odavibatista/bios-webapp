import { BreakpointObserver } from '@angular/cdk/layout';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { BiosApi } from '../../../core/api/bios-api';
import { formatCount } from '../../../shared/charts/chart-spec';
import { RULES_ERROR_KEY } from '../../../shared/forms/account-rules';
import { AsyncState } from '../../../shared/states/async-state';
import { ErrorState } from '../../../shared/states/error-state';
import { nameRule } from '../../search/search-rules';
import { SearchResults } from '../../search/search-results/search-results';
import { CnpjSearch } from '../cnpj-search/cnpj-search';

/** Consulta por nome com a mesma operação e a mesma lista da pesquisa. */
@Component({
  selector: 'bios-company-lookup',
  imports: [AsyncState, CnpjSearch, ErrorState, MatButtonModule, SearchResults],
  templateUrl: './company-lookup.html',
  styleUrl: './company-lookup.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyLookup {
  private readonly api = inject(BiosApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** CNPJ inválido digitado na barra, para exibir o erro no campo completo. */
  readonly cnpj = input<string>();

  private readonly query = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  protected readonly count = formatCount;
  protected readonly name = computed(() => this.query().get('nome')?.trim() ?? '');
  protected readonly page = computed(() => {
    const raw = this.query().get('pagina');
    const value = raw && /^[1-9]\d*$/.test(raw) ? Number(raw) : 1;
    return Number.isSafeInteger(value) ? value : 1;
  });
  protected readonly nameError = computed(() => {
    if (!this.name()) return null;
    const errors = nameRule(new FormControl(this.name()));
    return (errors?.[RULES_ERROR_KEY] as string[] | undefined)?.[0] ?? null;
  });
  protected readonly cards = toSignal(
    inject(BreakpointObserver)
      .observe('(max-width: 719.98px)')
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );
  protected readonly results = resource({
    params: () =>
      this.name() && !this.nameError() ? { name: this.name(), page: this.page() } : undefined,
    loader: ({ params }) =>
      this.api.searchCompanies({ query: { name: params.name, page: params.page, page_size: 20 } }),
  });

  protected goToPage(page: number): Promise<boolean> {
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { nome: this.name(), pagina: page === 1 ? null : page, cnpj: null },
    });
  }
}
