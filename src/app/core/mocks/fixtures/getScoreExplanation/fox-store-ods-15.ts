// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetScoreExplanationResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getScoreExplanation",
  "scenario": "fox-store-ods-15",
  "description": "Explicação do índice do ODS 15",
  "request": {
    "method": "GET",
    "path": "/companies/42240841000116/scores/15/explanation"
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "cnpj": "42240841000116",
    "ods_number": 15,
    "index_status": "AVAILABLE",
    "score_value": -6.25,
    "confidence_value": 0.4,
    "evidence_count": 2,
    "coverage_status": "HAS_RECORDS",
    "sources_without_records": [
      "IBAMA",
      "CGU_CNEP"
    ],
    "rules_version": "rf10-rf11-v3",
    "calculated_at": "2026-10-30T13:37:59.068Z",
    "contributions": [
      {
        "evidence": {
          "id": "6ae49c820f3f8176322f96ac",
          "category": "CONDUTA_ADMINISTRATIVA",
          "source_slug": "CGU_CEIS",
          "source": "CGU — Cadastro de Empresas Inidôneas e Suspensas (CEIS)",
          "state": "CONFIRMED",
          "current_state": "CONFIRMED",
          "source_reference": "308772",
          "source_url": "https://api.portaldatransparencia.gov.br/api-de-dados/ceis/308772",
          "collected_at": "2026-10-30T13:32:50.394Z",
          "valid_until": "2026-10-31T13:32:50.394Z"
        },
        "weight": 1.25,
        "weight_reason": "CGU_SANCTION_EXPIRED",
        "signal": "NEGATIVE",
        "points": -1.25
      },
      {
        "evidence": {
          "id": "6ae49c820f3f8176322f96ad",
          "category": "CONDUTA_ADMINISTRATIVA",
          "source_slug": "CGU_CEIS",
          "source": "CGU — Cadastro de Empresas Inidôneas e Suspensas (CEIS)",
          "state": "CONFIRMED",
          "current_state": "CONFIRMED",
          "source_reference": "406934",
          "source_url": "https://api.portaldatransparencia.gov.br/api-de-dados/ceis/406934",
          "collected_at": "2026-10-30T13:32:50.394Z",
          "valid_until": "2026-10-31T13:32:50.394Z"
        },
        "weight": 5,
        "weight_reason": null,
        "signal": "NEGATIVE",
        "points": -5
      }
    ]
  }
} satisfies CapturedResponse<GetScoreExplanationResponses, 200>;
