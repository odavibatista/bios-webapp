// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetCompanyProfileResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getCompanyProfile",
  "scenario": "fox-store",
  "description": "Perfil completo: Sanção do CEIS vencida em 2024 (registro histórico); situação cadastral inapta",
  "request": {
    "method": "GET",
    "path": "/companies/42240841000116"
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "cnpj": "42240841000116",
    "legal_name": "FOX STORE LTDA",
    "trade_name": "FOX STORE",
    "registration_status": "INAPTA",
    "registration_status_unrecognized": null,
    "company_size": "MICRO EMPRESA",
    "address": {
      "street": "RUA DAS ACUCENAS",
      "number": "26",
      "complement": null,
      "neighborhood": "BOA ESPERANCA",
      "city": "CONCEICAO DO CASTELO",
      "city_ibge_code": "3201704",
      "uf": "ES",
      "zipcode": "29370000"
    },
    "main_cnae": {
      "code": "4744099",
      "description": "COMÉRCIO VAREJISTA DE MATERIAIS DE CONSTRUÇÃO EM GERAL"
    },
    "secondary_cnaes": [
      {
        "code": "4712100",
        "description": "COMÉRCIO VAREJISTA DE MERCADORIAS EM GERAL, COM PREDOMINÂNCIA DE PRODUTOS ALIMENTÍCIOS - MINIMERCADOS, MERCEARIAS E ARMAZÉNS"
      },
      {
        "code": "4742300",
        "description": "COMÉRCIO VAREJISTA DE MATERIAL ELÉTRICO"
      },
      {
        "code": "4744001",
        "description": "COMÉRCIO VAREJISTA DE FERRAGENS E FERRAMENTAS"
      },
      {
        "code": "4744003",
        "description": "COMÉRCIO VAREJISTA DE MATERIAIS HIDRÁULICOS"
      },
      {
        "code": "4744005",
        "description": "COMÉRCIO VAREJISTA DE MATERIAIS DE CONSTRUÇÃO NÃO ESPECIFICADOS ANTERIORMENTE"
      },
      {
        "code": "4753900",
        "description": "COMÉRCIO VAREJISTA ESPECIALIZADO DE ELETRODOMÉSTICOS E EQUIPAMENTOS DE ÁUDIO E VÍDEO"
      },
      {
        "code": "4754703",
        "description": "COMÉRCIO VAREJISTA DE ARTIGOS DE ILUMINAÇÃO"
      },
      {
        "code": "4761001",
        "description": "COMÉRCIO VAREJISTA DE LIVROS"
      },
      {
        "code": "4761003",
        "description": "COMÉRCIO VAREJISTA DE ARTIGOS DE PAPELARIA"
      },
      {
        "code": "4771704",
        "description": "COMÉRCIO VAREJISTA DE MEDICAMENTOS VETERINÁRIOS"
      },
      {
        "code": "4789004",
        "description": "COMÉRCIO VAREJISTA DE ANIMAIS VIVOS E DE ARTIGOS E ALIMENTOS PARA ANIMAIS DE ESTIMAÇÃO"
      },
      {
        "code": "4789007",
        "description": "COMÉRCIO VAREJISTA DE EQUIPAMENTOS PARA ESCRITÓRIO"
      }
    ],
    "refreshed_at": "2026-10-30T13:32:50.231Z",
    "evidences": [
      {
        "category": "INFRACAO_AMBIENTAL",
        "evidences": [
          {
            "id": "6ae49c820f3f8176322f96a2",
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
            "id": "6ae49c820f3f8176322f96ac",
            "source_slug": "CGU_CEIS",
            "source": "CGU — Cadastro de Empresas Inidôneas e Suspensas (CEIS)",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Sanção administrativa registrada no CEIS",
            "source_reference": "308772",
            "source_url": "https://api.portaldatransparencia.gov.br/api-de-dados/ceis/308772",
            "details": {
              "id": "308772",
              "cnpj": "42240841000116",
              "authority": "TRIBUNAL REGIONAL ELEITORAL DE SAO PAULO",
              "sanctionType": "Impedimento/proibição de contratar com prazo determinado",
              "startDate": "2024-06-13",
              "endDate": "2024-10-12",
              "publicationDate": "2024-06-13"
            },
            "published_at": "2024-06-13T00:00:00.000Z",
            "collected_at": "2026-10-30T13:32:50.394Z",
            "valid_until": "2026-10-31T13:32:50.394Z"
          },
          {
            "id": "6ae49c820f3f8176322f96ad",
            "source_slug": "CGU_CEIS",
            "source": "CGU — Cadastro de Empresas Inidôneas e Suspensas (CEIS)",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Sanção administrativa registrada no CEIS",
            "source_reference": "406934",
            "source_url": "https://api.portaldatransparencia.gov.br/api-de-dados/ceis/406934",
            "details": {
              "id": "406934",
              "cnpj": "42240841000116",
              "authority": "SUPERINTÊNDENCIA REG. POL. RODOVI. FEDERAL-MA",
              "sanctionType": "Impedimento/proibição de contratar com prazo determinado",
              "startDate": "2026-10-28",
              "endDate": "2026-12-28",
              "publicationDate": null
            },
            "published_at": null,
            "collected_at": "2026-10-30T13:32:50.394Z",
            "valid_until": "2026-10-31T13:32:50.394Z"
          },
          {
            "id": "6ae49c820f3f8176322f96a6",
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
            "collected_at": "2026-10-30T13:32:50.395Z",
            "valid_until": "2026-10-31T13:32:50.395Z"
          }
        ]
      },
      {
        "category": "EMISSAO_GEE",
        "evidences": [
          {
            "id": "6ae49c820f3f8176322f96a0",
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
            "collected_at": "2026-10-30T13:32:50.378Z",
            "valid_until": "2026-10-30T13:47:50.378Z"
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
        "calculated_at": "2026-10-30T13:37:59.068Z",
        "contributions": []
      },
      {
        "ods_number": 15,
        "calculation_status": "CALCULATED",
        "index_status": "AVAILABLE",
        "score_value": -6.25,
        "confidence_value": 0.4,
        "evidence_count": 2,
        "coverage_status": "HAS_RECORDS",
        "sources_without_records": [
          "IBAMA",
          "CGU_CNEP"
        ],
        "rules_version": "rf10-rf11-v3",
        "calculated_at": "2026-10-30T13:37:59.068Z",
        "contributions": [
          {
            "evidence": {
              "id": "6ae49c820f3f8176322f96ac",
              "category": "CONDUTA_ADMINISTRATIVA",
              "source_slug": "CGU_CEIS",
              "source": "CGU — Cadastro de Empresas Inidôneas e Suspensas (CEIS)",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "308772",
              "source_url": "https://api.portaldatransparencia.gov.br/api-de-dados/ceis/308772",
              "collected_at": "2026-10-30T13:32:50.394Z",
              "valid_until": "2026-10-31T13:32:50.394Z"
            },
            "weight": 1.25,
            "weight_reason": "CGU_SANCTION_EXPIRED",
            "signal": "NEGATIVE",
            "points": -1.25
          },
          {
            "evidence": {
              "id": "6ae49c820f3f8176322f96ad",
              "category": "CONDUTA_ADMINISTRATIVA",
              "source_slug": "CGU_CEIS",
              "source": "CGU — Cadastro de Empresas Inidôneas e Suspensas (CEIS)",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "406934",
              "source_url": "https://api.portaldatransparencia.gov.br/api-de-dados/ceis/406934",
              "collected_at": "2026-10-30T13:32:50.394Z",
              "valid_until": "2026-10-31T13:32:50.394Z"
            },
            "weight": 5,
            "weight_reason": null,
            "signal": "NEGATIVE",
            "points": -5
          }
        ]
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
          "evidence_state": "CONFIRMED"
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
