// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetScoreExplanationResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getScoreExplanation",
  "scenario": "electro-aco-altona-ods-13",
  "description": "Explicação do índice do ODS 13",
  "request": {
    "method": "GET",
    "path": "/companies/82643537000134/scores/13/explanation"
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "cnpj": "82643537000134",
    "ods_number": 13,
    "index_status": "AVAILABLE",
    "score_value": 60,
    "confidence_value": 0.08333333333333333,
    "evidence_count": 1,
    "coverage_status": "HAS_RECORDS",
    "sources_without_records": [],
    "rules_version": "rf10-rf11-v3",
    "calculated_at": "2026-10-30T13:36:41.436Z",
    "contributions": [
      {
        "evidence": {
          "id": "6ae49d690f3f8176322f9734",
          "category": "EMISSAO_GEE",
          "source_slug": "GHG_PROTOCOL",
          "source": "GHG Protocol — Registro Público de Emissões",
          "state": "CONFIRMED",
          "current_state": "CONFIRMED",
          "source_reference": "5055/19",
          "source_url": "https://sistema-registropublicodeemissoesapi.fgv.br/GenerateReport/GenerateInventoryReport/5055/19/true",
          "collected_at": "2026-10-30T13:36:39.946Z",
          "valid_until": "2026-11-29T13:36:39.946Z"
        },
        "weight": 60,
        "weight_reason": null,
        "signal": "POSITIVE",
        "points": 60
      }
    ]
  }
} satisfies CapturedResponse<GetScoreExplanationResponses, 200>;
