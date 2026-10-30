// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { SearchCompaniesErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "searchCompanies",
  "scenario": "nome-curto",
  "description": "Texto sem palavra de 3 letras",
  "request": {
    "method": "GET",
    "path": "/companies",
    "query": {
      "name": "ab"
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
        "path": "name",
        "message": "Informe ao menos uma palavra com 3 letras ou mais."
      }
    ],
    "timestamp": "2026-10-30T13:38:00.849Z",
    "path": "/companies?name=ab"
  }
} satisfies CapturedResponse<SearchCompaniesErrors, 422>;
