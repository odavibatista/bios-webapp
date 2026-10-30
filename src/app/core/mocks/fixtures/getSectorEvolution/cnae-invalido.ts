// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetSectorEvolutionErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getSectorEvolution",
  "scenario": "cnae-invalido",
  "description": "CNAE fora do formato",
  "request": {
    "method": "GET",
    "path": "/sectors/abc/evolution",
    "query": {
      "ods": "13"
    }
  },
  "status": 422,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "statusCode": 422,
    "code": "VALIDATION_FAILED",
    "message": "Os dados enviados são inválidos.",
    "details": [
      {
        "path": "cnae",
        "message": "CNAE inválido: informe a divisão (2 dígitos), o grupo, a classe ou a subclasse."
      }
    ],
    "timestamp": "2026-10-30T13:37:17.741Z",
    "path": "/sectors/abc/evolution?ods=13"
  }
} satisfies CapturedResponse<GetSectorEvolutionErrors, 422>;
