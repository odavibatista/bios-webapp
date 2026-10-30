// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetCompanyProfileResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getCompanyProfile",
  "scenario": "gerdau",
  "description": "Perfil completo: Divisão CNAE 24; sem registro nas fontes, GHG não verificado (índices indisponíveis)",
  "request": {
    "method": "GET",
    "path": "/companies/33611500000119"
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "cnpj": "33611500000119",
    "legal_name": "GERDAU S.A.",
    "trade_name": null,
    "registration_status": "ATIVA",
    "registration_status_unrecognized": null,
    "company_size": "DEMAIS",
    "address": {
      "street": "AVENIDA DOUTORA RUTH CARDOSO",
      "number": "8501",
      "complement": "ANDAR 8 CONJ 2",
      "neighborhood": "PINHEIROS",
      "city": "SAO PAULO",
      "city_ibge_code": "3550308",
      "uf": "SP",
      "zipcode": "05425070"
    },
    "main_cnae": {
      "code": "2423702",
      "description": "PRODUÇÃO DE LAMINADOS LONGOS DE AÇO, EXCETO TUBOS"
    },
    "secondary_cnaes": [
      {
        "code": "4612500",
        "description": "REPRESENTANTES COMERCIAIS E AGENTES DO COMÉRCIO DE COMBUSTÍVEIS, MINERAIS, PRODUTOS SIDERÚRGICOS E QUÍMICOS"
      },
      {
        "code": "4619200",
        "description": "REPRESENTANTES COMERCIAIS E AGENTES DO COMÉRCIO DE MERCADORIAS EM GERAL NÃO ESPECIALIZADO"
      },
      {
        "code": "5231102",
        "description": "ATIVIDADES DO OPERADOR PORTUÁRIO"
      },
      {
        "code": "6462000",
        "description": "HOLDINGS DE INSTITUIÇÕES NÃO FINANCEIRAS"
      }
    ],
    "refreshed_at": "2026-10-30T13:29:57.369Z",
    "evidences": [
      {
        "category": "INFRACAO_AMBIENTAL",
        "evidences": [
          {
            "id": "6ae49bd50f3f8176322f6c15",
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
            "id": "6ae49bd50f3f8176322f6c51",
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
            "collected_at": "2026-10-30T13:29:57.608Z",
            "valid_until": "2026-10-31T13:29:57.608Z"
          },
          {
            "id": "6ae49bd50f3f8176322f6c43",
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
            "collected_at": "2026-10-30T13:29:57.609Z",
            "valid_until": "2026-10-31T13:29:57.609Z"
          }
        ]
      },
      {
        "category": "EMISSAO_GEE",
        "evidences": [
          {
            "id": "6ae49bd50f3f8176322f6c11",
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
            "collected_at": "2026-10-30T13:29:57.595Z",
            "valid_until": "2026-10-30T13:44:57.595Z"
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
        "calculated_at": "2026-10-30T13:37:56.815Z",
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
        "calculated_at": "2026-10-30T13:37:56.815Z",
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
