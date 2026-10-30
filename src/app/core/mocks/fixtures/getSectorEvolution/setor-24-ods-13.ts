// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetSectorEvolutionResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getSectorEvolution",
  "scenario": "setor-24-ods-13",
  "description": "METALURGIA, ODS 13",
  "request": {
    "method": "GET",
    "path": "/sectors/24/evolution",
    "query": {
      "ods": "13"
    }
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "cnae_division": "24",
    "cnae_division_description": "METALURGIA",
    "ods_number": 13,
    "history_status": "INSUFFICIENT",
    "windows": [
      {
        "window_start": "2026-10-01T00:00:00.000Z",
        "window_end": "2026-11-01T00:00:00.000Z",
        "average_score": 60,
        "average_confidence": 0.05,
        "company_count": 10,
        "scored_company_count": 6,
        "rules_version": "rf10-rf11-v3"
      }
    ]
  }
} satisfies CapturedResponse<GetSectorEvolutionResponses, 200>;
