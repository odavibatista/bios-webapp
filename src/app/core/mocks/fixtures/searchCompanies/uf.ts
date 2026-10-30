// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { SearchCompaniesResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "searchCompanies",
  "scenario": "uf",
  "description": "Empresas de MG",
  "request": {
    "method": "GET",
    "path": "/companies",
    "query": {
      "uf": "MG"
    }
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "data": [
      {
        "cnpj": "23637697000101",
        "legal_name": "ALCOA ALUMINIO S/A",
        "trade_name": null,
        "registration_status": "ATIVA",
        "city": "POCOS DE CALDAS",
        "uf": "MG",
        "main_cnae": {
          "code": "2441501",
          "description": "PRODUÇÃO DE ALUMÍNIO E SUAS LIGAS EM FORMAS PRIMÁRIAS"
        },
        "ods_score": null
      },
      {
        "cnpj": "17469701000177",
        "legal_name": "ARCELORMITTAL BRASIL S.A.",
        "trade_name": null,
        "registration_status": "ATIVA",
        "city": "BELO HORIZONTE",
        "uf": "MG",
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
      "page": 1,
      "page_size": 20,
      "total": 4,
      "total_pages": 1
    }
  }
} satisfies CapturedResponse<SearchCompaniesResponses, 200>;
