import type { Provider } from '@angular/core';
import { CompanyArchive } from './company-archive';
import { StaticCompanyArchive } from './static-company-archive';

/**
 * De onde vêm empresas, índices e setores: arquivos estáticos com respostas da API real, sempre no
 * ar. Os e2e trocam este arquivo (`angular.json`) para rodar sobre as capturas, que não mudam.
 */
export const COMPANY_ARCHIVE_PROVIDERS: Provider[] = [
  { provide: CompanyArchive, useClass: StaticCompanyArchive },
];
