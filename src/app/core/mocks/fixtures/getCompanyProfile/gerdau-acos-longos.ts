// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetCompanyProfileResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getCompanyProfile",
  "scenario": "gerdau-acos-longos",
  "description": "Perfil completo: Divisão CNAE 24; inventário GHG publicado com este CNPJ, mas não localizado pelo nome (GHG UNKNOWN)",
  "request": {
    "method": "GET",
    "path": "/companies/07358761000169"
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "cnpj": "07358761000169",
    "legal_name": "GERDAU ACOS LONGOS S.A.",
    "trade_name": "GERDAU COSIGUA",
    "registration_status": "ATIVA",
    "registration_status_unrecognized": null,
    "company_size": "DEMAIS",
    "address": {
      "street": "AVENIDA JOAO XXIII",
      "number": "6777",
      "complement": null,
      "neighborhood": "SANTA CRUZ",
      "city": "RIO DE JANEIRO",
      "city_ibge_code": "3304557",
      "uf": "RJ",
      "zipcode": "23565235"
    },
    "main_cnae": {
      "code": "2423702",
      "description": "PRODUÇÃO DE LAMINADOS LONGOS DE AÇO, EXCETO TUBOS"
    },
    "secondary_cnaes": [
      {
        "code": "0210101",
        "description": "CULTIVO DE EUCALIPTO"
      },
      {
        "code": "0210108",
        "description": "PRODUÇÃO DE CARVÃO VEGETAL - FLORESTAS PLANTADAS"
      },
      {
        "code": "0230600",
        "description": "ATIVIDADES DE APOIO À PRODUÇÃO FLORESTAL"
      },
      {
        "code": "2411300",
        "description": "PRODUÇÃO DE FERRO GUSA"
      },
      {
        "code": "2421100",
        "description": "PRODUÇÃO DE SEMI ACABADOS DE AÇO"
      },
      {
        "code": "2424501",
        "description": "PRODUÇÃO DE ARAMES DE AÇO"
      },
      {
        "code": "2424502",
        "description": "PRODUÇÃO DE RELAMINADOS, TREFILADOS E PERFILADOS DE AÇO, EXCETO ARAMES"
      },
      {
        "code": "2431800",
        "description": "PRODUÇÃO DE TUBOS DE AÇO COM COSTURA"
      },
      {
        "code": "2592602",
        "description": "FABRICAÇÃO DE PRODUTOS DE TREFILADOS DE METAL, EXCETO PADRONIZADOS"
      },
      {
        "code": "2599399",
        "description": "FABRICAÇÃO DE OUTROS PRODUTOS DE METAL NÃO ESPECIFICADOS ANTERIORMENTE"
      },
      {
        "code": "3511501",
        "description": "GERAÇÃO DE ENERGIA ELÉTRICA"
      },
      {
        "code": "3513100",
        "description": "COMÉRCIO ATACADISTA DE ENERGIA ELÉTRICA"
      },
      {
        "code": "4612500",
        "description": "REPRESENTANTES COMERCIAIS E AGENTES DO COMÉRCIO DE COMBUSTÍVEIS, MINERAIS, PRODUTOS SIDERÚRGICOS E QUÍMICOS"
      },
      {
        "code": "4679604",
        "description": "COMÉRCIO ATACADISTA ESPECIALIZADO DE MATERIAIS DE CONSTRUÇÃO NÃO ESPECIFICADOS ANTERIORMENTE"
      },
      {
        "code": "4679699",
        "description": "COMÉRCIO ATACADISTA DE MATERIAIS DE CONSTRUÇÃO EM GERAL"
      },
      {
        "code": "4685100",
        "description": "COMÉRCIO ATACADISTA DE PRODUTOS SIDERÚRGICOS E METALÚRGICOS, EXCETO PARA CONSTRUÇÃO"
      },
      {
        "code": "4687703",
        "description": "COMÉRCIO ATACADISTA DE RESÍDUOS E SUCATAS METÁLICOS"
      },
      {
        "code": "4689301",
        "description": "COMÉRCIO ATACADISTA DE PRODUTOS DA EXTRAÇÃO MINERAL, EXCETO COMBUSTÍVEIS"
      },
      {
        "code": "4689399",
        "description": "COMÉRCIO ATACADISTA ESPECIALIZADO EM OUTROS PRODUTOS INTERMEDIÁRIOS NÃO ESPECIFICADOS ANTERIORMENTE"
      },
      {
        "code": "5212500",
        "description": "CARGA E DESCARGA"
      },
      {
        "code": "8211300",
        "description": "SERVIÇOS COMBINADOS DE ESCRITÓRIO E APOIO ADMINISTRATIVO"
      }
    ],
    "refreshed_at": "2026-10-30T13:32:29.933Z",
    "evidences": [
      {
        "category": "INFRACAO_AMBIENTAL",
        "evidences": [
          {
            "id": "6ae49c6e0f3f8176322f95ef",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "NOT_FOUND",
            "signal": null,
            "summary": null,
            "source_reference": null,
            "source_url": null,
            "details": null,
            "published_at": null,
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          }
        ]
      },
      {
        "category": "CONDUTA_ADMINISTRATIVA",
        "evidences": [
          {
            "id": "6ae49c6e0f3f8176322f95f6",
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
            "collected_at": "2026-10-30T13:32:30.172Z",
            "valid_until": "2026-10-31T13:32:30.172Z"
          },
          {
            "id": "6ae49c6e0f3f8176322f95f3",
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
            "collected_at": "2026-10-30T13:32:30.173Z",
            "valid_until": "2026-10-31T13:32:30.173Z"
          }
        ]
      },
      {
        "category": "EMISSAO_GEE",
        "evidences": [
          {
            "id": "6ae49c6e0f3f8176322f95ed",
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
            "collected_at": "2026-10-30T13:32:30.158Z",
            "valid_until": "2026-10-30T13:47:30.158Z"
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
        "calculated_at": "2026-10-30T13:37:57.103Z",
        "contributions": []
      },
      {
        "ods_number": 15,
        "calculation_status": "CALCULATED",
        "index_status": "UNAVAILABLE",
        "score_value": null,
        "confidence_value": 0,
        "evidence_count": 0,
        "coverage_status": "NO_RECORDS_IN_ALL_SOURCES",
        "sources_without_records": [
          "IBAMA",
          "CGU_CEIS",
          "CGU_CNEP"
        ],
        "rules_version": "rf10-rf11-v3",
        "calculated_at": "2026-10-30T13:37:57.103Z",
        "contributions": []
      }
    ],
    "provenance": {
      "sources": [
        {
          "source_slug": "IBAMA",
          "origin": "PERSISTED",
          "evidence_state": "NOT_FOUND"
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
