// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { SearchCompaniesResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "searchCompanies",
  "scenario": "indice-minimo",
  "description": "ODS 13 com índice e confiança mínimos",
  "request": {
    "method": "GET",
    "path": "/companies",
    "query": {
      "ods": "13",
      "min_score": "0",
      "min_confidence": "0.3"
    }
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "data": [],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 0,
      "total_pages": 0
    }
  }
} satisfies CapturedResponse<SearchCompaniesResponses, 200>;
