// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetScoreExplanationResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getScoreExplanation",
  "scenario": "eccheli-ods-13",
  "description": "Explicação do índice do ODS 13",
  "request": {
    "method": "GET",
    "path": "/companies/50375702000128/scores/13/explanation"
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "cnpj": "50375702000128",
    "ods_number": 13,
    "index_status": "UNAVAILABLE",
    "score_value": null,
    "confidence_value": 0,
    "evidence_count": 0,
    "coverage_status": "NO_DATA",
    "sources_without_records": [],
    "rules_version": "rf10-rf11-v3",
    "calculated_at": "2026-10-30T13:37:58.497Z",
    "contributions": []
  }
} satisfies CapturedResponse<GetScoreExplanationResponses, 200>;
