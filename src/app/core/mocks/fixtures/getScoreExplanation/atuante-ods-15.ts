// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetScoreExplanationResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getScoreExplanation",
  "scenario": "atuante-ods-15",
  "description": "Explicação do índice do ODS 15",
  "request": {
    "method": "GET",
    "path": "/companies/33458350000155/scores/15/explanation"
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "cnpj": "33458350000155",
    "ods_number": 15,
    "index_status": "AVAILABLE",
    "score_value": -20,
    "confidence_value": 0.6122448979591837,
    "evidence_count": 6,
    "coverage_status": "HAS_RECORDS",
    "sources_without_records": [
      "IBAMA"
    ],
    "rules_version": "rf10-rf11-v3",
    "calculated_at": "2026-10-30T13:37:58.784Z",
    "contributions": [
      {
        "evidence": {
          "id": "6ae49c810f3f8176322f9690",
          "category": "CONDUTA_ADMINISTRATIVA",
          "source_slug": "CGU_CEIS",
          "source": "CGU — Cadastro de Empresas Inidôneas e Suspensas (CEIS)",
          "state": "CONFIRMED",
          "current_state": "CONFIRMED",
          "source_reference": "347062",
          "source_url": "https://api.portaldatransparencia.gov.br/api-de-dados/ceis/347062",
          "collected_at": "2026-10-30T13:32:48.597Z",
          "valid_until": "2026-10-31T13:32:48.597Z"
        },
        "weight": 5,
        "weight_reason": null,
        "signal": "NEGATIVE",
        "points": -5
      },
      {
        "evidence": {
          "id": "6ae49c810f3f8176322f9692",
          "category": "CONDUTA_ADMINISTRATIVA",
          "source_slug": "CGU_CEIS",
          "source": "CGU — Cadastro de Empresas Inidôneas e Suspensas (CEIS)",
          "state": "CONFIRMED",
          "current_state": "CONFIRMED",
          "source_reference": "363704",
          "source_url": "https://api.portaldatransparencia.gov.br/api-de-dados/ceis/363704",
          "collected_at": "2026-10-30T13:32:48.597Z",
          "valid_until": "2026-10-31T13:32:48.597Z"
        },
        "weight": 5,
        "weight_reason": null,
        "signal": "NEGATIVE",
        "points": -5
      },
      {
        "evidence": {
          "id": "6ae49c810f3f8176322f968f",
          "category": "CONDUTA_ADMINISTRATIVA",
          "source_slug": "CGU_CEIS",
          "source": "CGU — Cadastro de Empresas Inidôneas e Suspensas (CEIS)",
          "state": "CONFIRMED",
          "current_state": "CONFIRMED",
          "source_reference": "405977",
          "source_url": "https://api.portaldatransparencia.gov.br/api-de-dados/ceis/405977",
          "collected_at": "2026-10-30T13:32:48.597Z",
          "valid_until": "2026-10-31T13:32:48.597Z"
        },
        "weight": 5,
        "weight_reason": null,
        "signal": "NEGATIVE",
        "points": -5
      },
      {
        "evidence": {
          "id": "6ae49c810f3f8176322f9691",
          "category": "CONDUTA_ADMINISTRATIVA",
          "source_slug": "CGU_CEIS",
          "source": "CGU — Cadastro de Empresas Inidôneas e Suspensas (CEIS)",
          "state": "CONFIRMED",
          "current_state": "CONFIRMED",
          "source_reference": "405984",
          "source_url": "https://api.portaldatransparencia.gov.br/api-de-dados/ceis/405984",
          "collected_at": "2026-10-30T13:32:48.597Z",
          "valid_until": "2026-10-31T13:32:48.597Z"
        },
        "weight": 5,
        "weight_reason": null,
        "signal": "NEGATIVE",
        "points": -5
      },
      {
        "evidence": {
          "id": "6ae49c800f3f8176322f9687",
          "category": "CONDUTA_ADMINISTRATIVA",
          "source_slug": "CGU_CNEP",
          "source": "CGU — Cadastro Nacional de Empresas Punidas (CNEP)",
          "state": "CONFIRMED",
          "current_state": "CONFIRMED",
          "source_reference": "405977",
          "source_url": "https://api.portaldatransparencia.gov.br/api-de-dados/cnep/405977",
          "collected_at": "2026-10-30T13:32:48.597Z",
          "valid_until": "2026-10-31T13:32:48.597Z"
        },
        "weight": 5,
        "weight_reason": null,
        "signal": "NEGATIVE",
        "points": 0
      },
      {
        "evidence": {
          "id": "6ae49c800f3f8176322f9688",
          "category": "CONDUTA_ADMINISTRATIVA",
          "source_slug": "CGU_CNEP",
          "source": "CGU — Cadastro Nacional de Empresas Punidas (CNEP)",
          "state": "CONFIRMED",
          "current_state": "CONFIRMED",
          "source_reference": "405984",
          "source_url": "https://api.portaldatransparencia.gov.br/api-de-dados/cnep/405984",
          "collected_at": "2026-10-30T13:32:48.597Z",
          "valid_until": "2026-10-31T13:32:48.597Z"
        },
        "weight": 5,
        "weight_reason": null,
        "signal": "NEGATIVE",
        "points": 0
      }
    ]
  }
} satisfies CapturedResponse<GetScoreExplanationResponses, 200>;
