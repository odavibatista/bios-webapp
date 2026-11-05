import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  resource,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { BiosApi } from '../../../core/api/bios-api';
import { formatCnpj, INVALID_CNPJ_MESSAGE, parseCnpj } from '../../../shared/cnpj/cnpj';
import { describeError } from '../../../shared/errors/describe-error';
import { ErrorState } from '../../../shared/states/error-state';
import { LoadingState } from '../../../shared/states/loading-state';
import { COMPANIES_PATH, CnpjSearch } from '../cnpj-search/cnpj-search';
import { CompanyCharts } from '../company-charts/company-charts';
import { EnvironmentalEvidences } from '../environmental-evidences/environmental-evidences';
import { IndexEvolution } from '../index-evolution/index-evolution';
import { OdsScores } from '../ods-scores/ods-scores';
import { RegistrationData } from '../registration-data/registration-data';
import {
  companySizeLabel,
  formatCnae,
  registrationStatusLabel,
} from '../registration-data/registration-labels';

/** O que a tela mostra quando não há perfil. */
type Problem = 'invalid' | 'not-found' | 'failure';

/**
 * Perfil da empresa (`/empresas/:cnpj`; UC06; #24). A página mostra cabeçalho, dados cadastrais,
 * índices com explicação e evidências do mesmo `getCompanyProfile`.
 *
 * - CNPJ inválido na URL não chega à API (fluxo 2.1).
 * - CNPJ válido com máscara ou minúsculas troca a URL pela forma normalizada.
 * - "Não encontrada" (404, fluxo 3.3) e "indisponível" (503, fluxo 3.2) são telas diferentes: só a
 *   segunda oferece tentar de novo.
 */
@Component({
  selector: 'bios-company-profile',
  imports: [
    CompanyCharts,
    CnpjSearch,
    EnvironmentalEvidences,
    IndexEvolution,
    OdsScores,
    ErrorState,
    LoadingState,
    RegistrationData,
    RouterLink,
  ],
  templateUrl: './company-profile.html',
  styleUrl: './company-profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyProfile {
  private readonly api = inject(BiosApi);
  private readonly router = inject(Router);
  private readonly title = inject(Title);

  /** O CNPJ da URL, como veio. */
  readonly cnpj = input.required<string>();

  /** O CNPJ normalizado, ou `null` se o da URL não for válido. */
  protected readonly normalized = computed(() => parseCnpj(this.cnpj()));
  protected readonly formatted = computed(() => formatCnpj(this.normalized() ?? this.cnpj()));

  protected readonly profile = resource({
    // Só consulta o CNPJ válido e já na forma normalizada (a outra forma é trocada na URL).
    params: () => {
      const cnpj = this.normalized();

      return cnpj && cnpj === this.cnpj() ? cnpj : undefined;
    },
    loader: ({ params: cnpj }) => this.api.getCompanyProfile({ path: { cnpj } }),
  });

  /** A média mais recente do setor por ODS. Sem média publicada, o medidor fica sem marca. */
  protected readonly sectorAverages = resource({
    params: () => {
      if (!this.profile.hasValue()) return undefined;

      const { main_cnae, ods_scores } = this.profile.value();

      return { cnae: main_cnae.code.slice(0, 2), ods: ods_scores.map((score) => score.ods_number) };
    },
    loader: async ({ params: { cnae, ods } }) => {
      const averages = await Promise.all(ods.map((item) => this.sectorAverage(cnae, item)));

      return Object.fromEntries(
        averages.flatMap((average, index) => (average === null ? [] : [[ods[index], average]])),
      );
    },
  });

  protected readonly problem = computed<Problem | null>(() => {
    if (!this.normalized()) return 'invalid';
    if (this.profile.status() !== 'error') return null;

    const code = describeError(this.profile.error()).code;

    if (code === 'INVALID_CNPJ') return 'invalid';
    return code === 'COMPANY_NOT_FOUND' ? 'not-found' : 'failure';
  });

  protected readonly invalidMessage = INVALID_CNPJ_MESSAGE;
  protected readonly notFoundMessage = computed(() =>
    this.problem() === 'not-found' ? describeError(this.profile.error()).message : null,
  );
  protected readonly companiesPath = COMPANIES_PATH;
  protected readonly sizeLabel = companySizeLabel;
  protected readonly cnaeLabel = formatCnae;
  protected readonly statusLabel = registrationStatusLabel;

  private async sectorAverage(cnae: string, ods: number): Promise<number | null> {
    try {
      const { windows } = await this.api.getSectorEvolution({
        path: { cnae },
        query: { ods },
      });

      const published = windows.filter(({ average_score }) => average_score !== null);

      return published[published.length - 1]?.average_score ?? null;
    } catch {
      return null;
    }
  }

  constructor() {
    effect(() => {
      const cnpj = this.normalized();

      if (cnpj && cnpj !== this.cnpj()) {
        void this.router.navigate([COMPANIES_PATH, cnpj], { replaceUrl: true });
      }
    });

    // A aba mostra a empresa aberta, para quem volta pelo histórico ou tem várias abas.
    effect(() => {
      if (this.profile.hasValue()) this.title.setTitle(`${this.profile.value().legal_name} — BIOS`);
    });
  }
}
