// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetCompanyProfileResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getCompanyProfile",
  "scenario": "aco-cearense",
  "description": "Perfil completo: Divisão CNAE 24; autos do IBAMA; GHG não verificado nesta coleta (UNKNOWN)",
  "request": {
    "method": "GET",
    "path": "/companies/00990842000138"
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "cnpj": "00990842000138",
    "legal_name": "ACO CEARENSE INDUSTRIAL LTDA",
    "trade_name": null,
    "registration_status": "ATIVA",
    "registration_status_unrecognized": null,
    "company_size": "DEMAIS",
    "address": {
      "street": "RODOVIA ANTIGA BR 222",
      "number": "S/N",
      "complement": "KM 19",
      "neighborhood": "GENIPABU",
      "city": "CAUCAIA",
      "city_ibge_code": "2303709",
      "uf": "CE",
      "zipcode": "61616000"
    },
    "main_cnae": {
      "code": "2431800",
      "description": "PRODUÇÃO DE TUBOS DE AÇO COM COSTURA"
    },
    "secondary_cnaes": [
      {
        "code": "2439300",
        "description": "PRODUÇÃO DE OUTROS TUBOS DE FERRO E AÇO"
      },
      {
        "code": "4685100",
        "description": "COMÉRCIO ATACADISTA DE PRODUTOS SIDERÚRGICOS E METALÚRGICOS, EXCETO PARA CONSTRUÇÃO"
      },
      {
        "code": "4672900",
        "description": "COMÉRCIO ATACADISTA DE FERRAGENS E FERRAMENTAS"
      },
      {
        "code": "4744001",
        "description": "COMÉRCIO VAREJISTA DE FERRAGENS E FERRAMENTAS"
      },
      {
        "code": "4679699",
        "description": "COMÉRCIO ATACADISTA DE MATERIAIS DE CONSTRUÇÃO EM GERAL"
      },
      {
        "code": "4744099",
        "description": "COMÉRCIO VAREJISTA DE MATERIAIS DE CONSTRUÇÃO EM GERAL"
      },
      {
        "code": "4930202",
        "description": "TRANSPORTE RODOVIÁRIO DE CARGA, EXCETO PRODUTOS PERIGOSOS E MUDANÇAS, INTERMUNICIPAL, INTERESTADUAL E INTERNACIONAL"
      }
    ],
    "refreshed_at": "2026-10-30T13:36:35.224Z",
    "evidences": [
      {
        "category": "INFRACAO_AMBIENTAL",
        "evidences": [
          {
            "id": "6ae49464703dbcb483fe8f8f",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Multa simples: Construir, reformar, ampliar, instalar ou fazer funcionar estabelecimentos, obras ou serviços potencialmente poluidores ou utilizadores de recursos naturais, sem licença ou autorização dos órgãos ambientais competentes, em desacordo com a licença obtida ou contrariando as normas legais e regulamentos pertinentes. — R$ 30.000,00 (CAUCAIA/CE)",
            "source_reference": "343440-D",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
            "details": {
              "resource": "AUTO_INFRACAO",
              "notice_type": "Multa simples",
              "infraction_type": "Controle Ambiental",
              "infraction_code": "609906",
              "infraction_description": "Construir, reformar, ampliar, instalar ou fazer funcionar estabelecimentos, obras ou serviços potencialmente poluidores ou utilizadores de recursos naturais, sem licença ou autorização dos órgãos ambientais competentes, em desacordo com a licença obtida ou contrariando as normas legais e regulamentos pertinentes.",
              "fine_amount": 30000,
              "municipality": "CAUCAIA",
              "municipality_code": "2303709",
              "uf": "CE",
              "process_number": "02007.002403/2008-14",
              "status": "Lavrado"
            },
            "published_at": "2008-09-12T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          },
          {
            "id": "6ae49439703dbcb483fe38bb",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Multa simples — R$ 30.000,00 (CAUCAIA/CE)",
            "source_reference": "479019-D",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
            "details": {
              "resource": "AUTO_INFRACAO",
              "notice_type": "Multa simples",
              "fine_amount": 30000,
              "municipality": "CAUCAIA",
              "municipality_code": "2303709",
              "uf": "CE",
              "process_number": "02007.003394/2006-17",
              "status": "Lavrado"
            },
            "published_at": "2006-12-18T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          }
        ]
      },
      {
        "category": "CONDUTA_ADMINISTRATIVA",
        "evidences": [
          {
            "id": "6ae49d630f3f8176322f970a",
            "source_slug": "CGU_CEIS",
            "source": "CGU — Cadastro de Empresas Inidôneas e Suspensas (CEIS)",
            "ods_number": 15,
            "state": "NOT_FOUND",
            "signal": null,
            "summary": null,
            "source_reference": null,
            "source_url": null,
            "details": null,
            "published_at": null,
            "collected_at": "2026-10-30T13:36:35.511Z",
            "valid_until": "2026-10-31T13:36:35.511Z"
          },
          {
            "id": "6ae49d630f3f8176322f9707",
            "source_slug": "CGU_CNEP",
            "source": "CGU — Cadastro Nacional de Empresas Punidas (CNEP)",
            "ods_number": 15,
            "state": "NOT_FOUND",
            "signal": null,
            "summary": null,
            "source_reference": null,
            "source_url": null,
            "details": null,
            "published_at": null,
            "collected_at": "2026-10-30T13:36:35.512Z",
            "valid_until": "2026-10-31T13:36:35.512Z"
          }
        ]
      },
      {
        "category": "EMISSAO_GEE",
        "evidences": [
          {
            "id": "6ae49d630f3f8176322f9702",
            "source_slug": "GHG_PROTOCOL",
            "source": "GHG Protocol — Registro Público de Emissões",
            "ods_number": 13,
            "state": "UNKNOWN",
            "signal": null,
            "summary": null,
            "source_reference": null,
            "source_url": null,
            "details": null,
            "published_at": null,
            "collected_at": "2026-10-30T13:36:37.499Z",
            "valid_until": "2026-10-30T13:51:37.499Z"
          }
        ]
      }
    ],
    "ods_scores": [
      {
        "ods_number": 13,
        "calculation_status": "CALCULATED",
        "index_status": "UNAVAILABLE",
        "score_value": null,
        "confidence_value": 0,
        "evidence_count": 0,
        "coverage_status": "NO_DATA",
        "sources_without_records": [],
        "rules_version": "rf10-rf11-v3",
        "calculated_at": "2026-10-30T13:36:37.664Z",
        "contributions": []
      },
      {
        "ods_number": 15,
        "calculation_status": "CALCULATED",
        "index_status": "AVAILABLE",
        "score_value": -80,
        "confidence_value": 0.5,
        "evidence_count": 2,
        "coverage_status": "HAS_RECORDS",
        "sources_without_records": [
          "CGU_CEIS",
          "CGU_CNEP"
        ],
        "rules_version": "rf10-rf11-v3",
        "calculated_at": "2026-10-30T13:36:37.664Z",
        "contributions": [
          {
            "evidence": {
              "id": "6ae49464703dbcb483fe8f8f",
              "category": "INFRACAO_AMBIENTAL",
              "source_slug": "IBAMA",
              "source": "IBAMA — Dados Abertos",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "343440-D",
              "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
              "collected_at": "2026-10-30T12:49:25.354Z",
              "valid_until": "2026-11-01T12:49:25.354Z"
            },
            "weight": 40,
            "weight_reason": null,
            "signal": "NEGATIVE",
            "points": -40
          },
          {
            "evidence": {
              "id": "6ae49439703dbcb483fe38bb",
              "category": "INFRACAO_AMBIENTAL",
              "source_slug": "IBAMA",
              "source": "IBAMA — Dados Abertos",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "479019-D",
              "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
              "collected_at": "2026-10-30T12:49:25.354Z",
              "valid_until": "2026-11-01T12:49:25.354Z"
            },
            "weight": 40,
            "weight_reason": null,
            "signal": "NEGATIVE",
            "points": -40
          }
        ]
      }
    ],
    "provenance": {
      "sources": [
        {
          "source_slug": "IBAMA",
          "origin": "PERSISTED",
          "evidence_state": "CONFIRMED"
        },
        {
          "source_slug": "CGU_CEIS",
          "origin": "PERSISTED",
          "evidence_state": "NOT_FOUND"
        },
        {
          "source_slug": "CGU_CNEP",
          "origin": "PERSISTED",
          "evidence_state": "NOT_FOUND"
        },
        {
          "source_slug": "GHG_PROTOCOL",
          "origin": "UNAVAILABLE",
          "evidence_state": "UNKNOWN"
        }
      ],
      "scores_pending": false,
      "retry_after_seconds": 900
    }
  }
} satisfies CapturedResponse<GetCompanyProfileResponses, 200>;
