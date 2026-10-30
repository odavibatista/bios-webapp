// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { SearchCompaniesResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "searchCompanies",
  "scenario": "setor-pagina-2",
  "description": "Segunda página com 5 por página",
  "request": {
    "method": "GET",
    "path": "/companies",
    "query": {
      "cnae": "24",
      "page": "2",
      "page_size": "5"
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
      },
      {
        "cnpj": "04735087000104",
        "legal_name": "SIDERMIN - SIDERURGICA MINEIRA LTDA",
        "trade_name": "SIDERMIN",
        "registration_status": "ATIVA",
        "city": "SETE LAGOAS",
        "uf": "MG",
        "main_cnae": {
          "code": "2411300",
          "description": "PRODUÇÃO DE FERRO GUSA"
        },
        "ods_score": null
      },
      {
        "cnpj": "07005330000119",
        "legal_name": "TERNIUM BRASIL LTDA.",
        "trade_name": null,
        "registration_status": "ATIVA",
        "city": "RIO DE JANEIRO",
        "uf": "RJ",
        "main_cnae": {
          "code": "2421100",
          "description": "PRODUÇÃO DE SEMI ACABADOS DE AÇO"
        },
        "ods_score": null
      },
      {
        "cnpj": "60894730000105",
        "legal_name": "USINAS SIDERURGICAS DE MINAS GERAIS S/A. USIMINAS",
        "trade_name": null,
        "registration_status": "ATIVA",
        "city": "BELO HORIZONTE",
        "uf": "MG",
        "main_cnae": {
          "code": "2422901",
          "description": "PRODUÇÃO DE LAMINADOS PLANOS DE AÇO AO CARBONO, REVESTIDOS OU NÃO"
        },
        "ods_score": null
      }
    ],
    "pagination": {
      "page": 2,
      "page_size": 5,
      "total": 10,
      "total_pages": 2
    }
  }
} satisfies CapturedResponse<SearchCompaniesResponses, 200>;
