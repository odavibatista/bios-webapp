import { InjectionToken } from '@angular/core';
import type { BiosOperation } from '../api/bios-api';
import type { CaptureKey } from './fixtures';

/** Conta que já existe na versão de apresentação, para quem avalia entrar sem se cadastrar. */
export interface MockDemoAccount {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

/**
 * Configuração da implementação mockada (#14). Tudo o que muda o comportamento vem daqui, nunca
 * de sorteio: a mesma configuração dá a mesma resposta (lição dos e2e instáveis do back-end).
 */
export interface MockApiConfig {
  /** Espera simulada antes de cada resposta, em milissegundos (0 nos testes). */
  latencyMs: number;

  /**
   * Cenários de demonstração: a operação sempre falha com a resposta capturada indicada
   * (ex.: `exportCompaniesXlsx` → `exportCompaniesXlsx/limite-excedido`).
   */
  forcedErrors: Partial<Record<BiosOperation, CaptureKey>>;

  /** Contas de demonstração, todas confirmadas e com a mesma senha. */
  demoAccounts: MockDemoAccount[];

  /** Senha das contas de demonstração (só do mock; nenhuma conta real a usa). */
  demoPassword: string;

  /** Validade do access token emitido pelo mock, em segundos (a API usa 15 minutos). */
  accessTokenTtlSeconds: number;

  /** Teto de empresas por exportação (`EXPORT_MAX_COMPANIES` da API). */
  exportMaxCompanies: number;

  /** Relógio do mock: tokens, datas de criação e bloqueios usam este instante. */
  now: () => number;
}

export const DEFAULT_MOCK_API_CONFIG: MockApiConfig = {
  latencyMs: 350,
  forcedErrors: {},
  demoAccounts: [
    {
      id: '6ae498260f3f8176322d018e',
      name: 'Conta de Demonstração',
      email: 'apresentacao@example.com',
      role: 'USER',
    },
    {
      id: '6ae498260f3f8176322d0190',
      name: 'Administração de Demonstração',
      email: 'administracao@example.com',
      role: 'ADMIN',
    },
  ],
  demoPassword: 'Apresentacao2026',
  accessTokenTtlSeconds: 900,
  exportMaxCompanies: 5000,
  now: () => Date.now(),
};

export const MOCK_API_CONFIG = new InjectionToken<MockApiConfig>('MOCK_API_CONFIG', {
  factory: () => DEFAULT_MOCK_API_CONFIG,
});
