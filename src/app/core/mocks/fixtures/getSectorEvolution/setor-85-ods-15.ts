// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetSectorEvolutionResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getSectorEvolution",
  "scenario": "setor-85-ods-15",
  "description": "EDUCAÇÃO, ODS 15",
  "request": {
    "method": "GET",
    "path": "/sectors/85/evolution",
    "query": {
      "ods": "15"
    }
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "cnae_division": "85",
    "cnae_division_description": "EDUCAÇÃO",
    "ods_number": 15,
    "history_status": "INSUFFICIENT",
    "windows": [
      {
        "window_start": "2026-10-01T00:00:00.000Z",
        "window_end": "2026-11-01T00:00:00.000Z",
        "average_score": null,
        "average_confidence": null,
        "company_count": 1,
        "scored_company_count": 0,
        "rules_version": "rf10-rf11-v3"
      }
    ]
  }
} satisfies CapturedResponse<GetSectorEvolutionResponses, 200>;
