// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { SearchCompaniesErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "searchCompanies",
  "scenario": "ordem-sem-ods",
  "description": "Ordenação sem ODS",
  "request": {
    "method": "GET",
    "path": "/companies",
    "query": {
      "cnae": "24",
      "order": "desc"
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
        "path": "order",
        "message": "Informe o ODS (`ods`) a que o filtro se refere."
      }
    ],
    "timestamp": "2026-10-30T13:38:01.968Z",
    "path": "/companies?cnae=24&order=desc"
  }
} satisfies CapturedResponse<SearchCompaniesErrors, 422>;
