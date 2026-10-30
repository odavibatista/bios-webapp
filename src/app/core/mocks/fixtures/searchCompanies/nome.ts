// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { SearchCompaniesResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "searchCompanies",
  "scenario": "nome",
  "description": "Busca por nome",
  "request": {
    "method": "GET",
    "path": "/companies",
    "query": {
      "name": "gerdau"
    }
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "data": [
      {
        "cnpj": "07358761000169",
        "legal_name": "GERDAU ACOS LONGOS S.A.",
        "trade_name": "GERDAU COSIGUA",
        "registration_status": "ATIVA",
        "city": "RIO DE JANEIRO",
        "uf": "RJ",
        "main_cnae": {
          "code": "2423702",
          "description": "PRODUÇÃO DE LAMINADOS LONGOS DE AÇO, EXCETO TUBOS"
        },
        "ods_score": null
      },
      {
        "cnpj": "33611500000119",
        "legal_name": "GERDAU S.A.",
        "trade_name": null,
        "registration_status": "ATIVA",
        "city": "SAO PAULO",
        "uf": "SP",
        "main_cnae": {
          "code": "2423702",
          "description": "PRODUÇÃO DE LAMINADOS LONGOS DE AÇO, EXCETO TUBOS"
        },
        "ods_score": null
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 2,
      "total_pages": 1
    }
  }
} satisfies CapturedResponse<SearchCompaniesResponses, 200>;
