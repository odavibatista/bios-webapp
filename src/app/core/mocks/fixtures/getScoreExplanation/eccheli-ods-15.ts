// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetScoreExplanationResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getScoreExplanation",
  "scenario": "eccheli-ods-15",
  "description": "Explicação do índice do ODS 15",
  "request": {
    "method": "GET",
    "path": "/companies/50375702000128/scores/15/explanation"
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "cnpj": "50375702000128",
    "ods_number": 15,
    "index_status": "AVAILABLE",
    "score_value": -5,
    "confidence_value": 0.2777777777777778,
    "evidence_count": 1,
    "coverage_status": "HAS_RECORDS",
    "sources_without_records": [
      "IBAMA",
      "CGU_CNEP"
    ],
    "rules_version": "rf10-rf11-v3",
    "calculated_at": "2026-10-30T13:37:58.497Z",
    "contributions": [
      {
        "evidence": {
          "id": "6ae49c7e0f3f8176322f9666",
          "category": "CONDUTA_ADMINISTRATIVA",
          "source_slug": "CGU_CEIS",
          "source": "CGU — Cadastro de Empresas Inidôneas e Suspensas (CEIS)",
          "state": "CONFIRMED",
          "current_state": "CONFIRMED",
          "source_reference": "375021",
          "source_url": "https://api.portaldatransparencia.gov.br/api-de-dados/ceis/375021",
          "collected_at": "2026-10-30T13:32:46.394Z",
          "valid_until": "2026-10-31T13:32:46.394Z"
        },
        "weight": 5,
        "weight_reason": null,
        "signal": "NEGATIVE",
        "points": -5
      }
    ]
  }
} satisfies CapturedResponse<GetScoreExplanationResponses, 200>;
