// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { SearchCompaniesResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "searchCompanies",
  "scenario": "setor-ods-13-desc",
  "description": "Divisão 24, ODS 13, do maior para o menor",
  "request": {
    "method": "GET",
    "path": "/companies",
    "query": {
      "cnae": "24",
      "ods": "13",
      "order": "desc"
    }
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "data": [
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
        "ods_score": {
          "ods_number": 13,
          "score_value": 60,
          "confidence_value": 0.08333333333333333
        }
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
        "ods_score": {
          "ods_number": 13,
          "score_value": 60,
          "confidence_value": 0.08333333333333333
        }
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
        "ods_score": {
          "ods_number": 13,
          "score_value": 60,
          "confidence_value": 0.08333333333333333
        }
      },
      {
        "cnpj": "33042730000104",
        "legal_name": "COMPANHIA SIDERURGICA NACIONAL",
        "trade_name": "COMPANHIA SIDERURGICA NACIONAL",
        "registration_status": "ATIVA",
        "city": "SAO PAULO",
        "uf": "SP",
        "main_cnae": {
          "code": "2422901",
          "description": "PRODUÇÃO DE LAMINADOS PLANOS DE AÇO AO CARBONO, REVESTIDOS OU NÃO"
        },
        "ods_score": {
          "ods_number": 13,
          "score_value": 60,
          "confidence_value": 0.08333333333333333
        }
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
        "ods_score": {
          "ods_number": 13,
          "score_value": 60,
          "confidence_value": 0.08333333333333333
        }
      },
      {
        "cnpj": "82643537000134",
        "legal_name": "ELECTRO ACO ALTONA S A",
        "trade_name": null,
        "registration_status": "ATIVA",
        "city": "BLUMENAU",
        "uf": "SC",
        "main_cnae": {
          "code": "2451200",
          "description": "FUNDIÇÃO DE FERRO E AÇO"
        },
        "ods_score": {
          "ods_number": 13,
          "score_value": 60,
          "confidence_value": 0.08333333333333333
        }
      },
      {
        "cnpj": "00990842000138",
        "legal_name": "ACO CEARENSE INDUSTRIAL LTDA",
        "trade_name": null,
        "registration_status": "ATIVA",
        "city": "CAUCAIA",
        "uf": "CE",
        "main_cnae": {
          "code": "2431800",
          "description": "PRODUÇÃO DE TUBOS DE AÇO COM COSTURA"
        },
        "ods_score": {
          "ods_number": 13,
          "score_value": null,
          "confidence_value": 0
        }
      },
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
        "ods_score": {
          "ods_number": 13,
          "score_value": null,
          "confidence_value": 0
        }
      },
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
        "ods_score": {
          "ods_number": 13,
          "score_value": null,
          "confidence_value": 0
        }
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
        "ods_score": {
          "ods_number": 13,
          "score_value": null,
          "confidence_value": 0
        }
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 10,
      "total_pages": 1
    }
  }
} satisfies CapturedResponse<SearchCompaniesResponses, 200>;
