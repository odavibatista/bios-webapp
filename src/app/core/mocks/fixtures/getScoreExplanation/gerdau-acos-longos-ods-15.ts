// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetScoreExplanationResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getScoreExplanation",
  "scenario": "gerdau-acos-longos-ods-15",
  "description": "Explicação do índice do ODS 15",
  "request": {
    "method": "GET",
    "path": "/companies/07358761000169/scores/15/explanation"
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "cnpj": "07358761000169",
    "ods_number": 15,
    "index_status": "UNAVAILABLE",
    "score_value": null,
    "confidence_value": 0,
    "evidence_count": 0,
    "coverage_status": "NO_RECORDS_IN_ALL_SOURCES",
    "sources_without_records": [
      "IBAMA",
      "CGU_CEIS",
      "CGU_CNEP"
    ],
    "rules_version": "rf10-rf11-v3",
    "calculated_at": "2026-10-30T13:37:57.103Z",
    "contributions": []
  }
} satisfies CapturedResponse<GetScoreExplanationResponses, 200>;
