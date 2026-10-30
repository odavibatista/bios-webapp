// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { SearchCompaniesResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "searchCompanies",
  "scenario": "nome-sem-resultado",
  "description": "Nenhuma empresa da base casa o nome",
  "request": {
    "method": "GET",
    "path": "/companies",
    "query": {
      "name": "empresa inexistente demonstracao"
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
