// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { SearchCompaniesErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "searchCompanies",
  "scenario": "ods-nao-calculado",
  "description": "ODS fora dos calculados (UC08, 3.1)",
  "request": {
    "method": "GET",
    "path": "/companies",
    "query": {
      "cnae": "24",
      "ods": "7"
    }
  },
  "status": 422,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "statusCode": 422,
    "code": "ODS_NOT_AVAILABLE",
    "message": "O ODS 7 não é calculado pelo BIOS. ODS disponíveis: 13, 15.",
    "details": {
      "ods": 7,
      "valid_ods": [
        13,
        15
      ]
    },
    "timestamp": "2026-10-30T13:38:01.960Z",
    "path": "/companies?cnae=24&ods=7"
  }
} satisfies CapturedResponse<SearchCompaniesErrors, 422>;
