// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetSectorEvolutionResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getSectorEvolution",
  "scenario": "setor-47-ods-15",
  "description": "COMÉRCIO VAREJISTA, ODS 15",
  "request": {
    "method": "GET",
    "path": "/sectors/47/evolution",
    "query": {
      "ods": "15"
    }
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "cnae_division": "47",
    "cnae_division_description": "COMÉRCIO VAREJISTA",
    "ods_number": 15,
    "history_status": "INSUFFICIENT",
    "windows": [
      {
        "window_start": "2026-10-01T00:00:00.000Z",
        "window_end": "2026-11-01T00:00:00.000Z",
        "average_score": null,
        "average_confidence": null,
        "company_count": 3,
        "scored_company_count": 2,
        "rules_version": "rf10-rf11-v3"
      }
    ]
  }
} satisfies CapturedResponse<GetSectorEvolutionResponses, 200>;
