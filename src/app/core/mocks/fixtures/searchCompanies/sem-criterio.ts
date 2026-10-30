// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { SearchCompaniesErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "searchCompanies",
  "scenario": "sem-criterio",
  "description": "Nenhum critério informado",
  "request": {
    "method": "GET",
    "path": "/companies"
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
        "path": "",
        "message": "Informe ao menos um critério: nome, uf, city, cnae ou ods."
      }
    ],
    "timestamp": "2026-10-30T13:38:00.856Z",
    "path": "/companies"
  }
} satisfies CapturedResponse<SearchCompaniesErrors, 422>;
