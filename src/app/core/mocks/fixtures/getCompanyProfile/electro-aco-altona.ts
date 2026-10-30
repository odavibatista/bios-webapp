// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetCompanyProfileResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getCompanyProfile",
  "scenario": "electro-aco-altona",
  "description": "Perfil completo: Divisão CNAE 24; inventário de emissões confirmado no GHG Protocol, sem autos do IBAMA",
  "request": {
    "method": "GET",
    "path": "/companies/82643537000134"
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "cnpj": "82643537000134",
    "legal_name": "ELECTRO ACO ALTONA S A",
    "trade_name": null,
    "registration_status": "ATIVA",
    "registration_status_unrecognized": null,
    "company_size": "DEMAIS",
    "address": {
      "street": "RUA ENG PAUL WERNER",
      "number": "925",
      "complement": null,
      "neighborhood": "ITOUPAVA SECA",
      "city": "BLUMENAU",
      "city_ibge_code": "4202404",
      "uf": "SC",
      "zipcode": "89030900"
    },
    "main_cnae": {
      "code": "2451200",
      "description": "FUNDIÇÃO DE FERRO E AÇO"
    },
    "secondary_cnaes": [
      {
        "code": "2599399",
        "description": "FABRICAÇÃO DE OUTROS PRODUTOS DE METAL NÃO ESPECIFICADOS ANTERIORMENTE"
      },
      {
        "code": "3812200",
        "description": "COLETA DE RESÍDUOS PERIGOSOS"
      },
      {
        "code": "4663000",
        "description": "COMÉRCIO ATACADISTA DE MÁQUINAS E EQUIPAMENTOS PARA USO INDUSTRIAL; PARTES E PEÇAS"
      },
      {
        "code": "4930202",
        "description": "TRANSPORTE RODOVIÁRIO DE CARGA, EXCETO PRODUTOS PERIGOSOS E MUDANÇAS, INTERMUNICIPAL, INTERESTADUAL E INTERNACIONAL"
      },
      {
        "code": "4930203",
        "description": "TRANSPORTE RODOVIÁRIO DE PRODUTOS PERIGOSOS"
      }
    ],
    "refreshed_at": "2026-10-30T13:36:39.774Z",
    "evidences": [
      {
        "category": "INFRACAO_AMBIENTAL",
        "evidences": [
          {
            "id": "6ae49d670f3f8176322f9728",
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
            "id": "6ae49d680f3f8176322f9730",
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
            "collected_at": "2026-10-30T13:36:39.960Z",
            "valid_until": "2026-10-31T13:36:39.960Z"
          },
          {
            "id": "6ae49d680f3f8176322f972c",
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
            "collected_at": "2026-10-30T13:36:39.960Z",
            "valid_until": "2026-10-31T13:36:39.960Z"
          }
        ]
      },
      {
        "category": "EMISSAO_GEE",
        "evidences": [
          {
            "id": "6ae49d690f3f8176322f9734",
            "source_slug": "GHG_PROTOCOL",
            "source": "GHG Protocol — Registro Público de Emissões",
            "ods_number": 13,
            "state": "CONFIRMED",
            "signal": "POSITIVE",
            "summary": "Inventário de emissões de GEE publicado: ano 2025.",
            "source_reference": "5055/19",
            "source_url": "https://sistema-registropublicodeemissoesapi.fgv.br/GenerateReport/GenerateInventoryReport/5055/19/true",
            "details": {
              "organizationId": 5055,
              "cycleId": 19,
              "inventoryYear": 2025
            },
            "published_at": null,
            "collected_at": "2026-10-30T13:36:39.946Z",
            "valid_until": "2026-11-29T13:36:39.946Z"
          }
        ]
      }
    ],
    "ods_scores": [
      {
        "ods_number": 13,
        "calculation_status": "CALCULATED",
        "index_status": "AVAILABLE",
        "score_value": 60,
        "confidence_value": 0.08333333333333333,
        "evidence_count": 1,
        "coverage_status": "HAS_RECORDS",
        "sources_without_records": [],
        "rules_version": "rf10-rf11-v3",
        "calculated_at": "2026-10-30T13:36:41.436Z",
        "contributions": [
          {
            "evidence": {
              "id": "6ae49d690f3f8176322f9734",
              "category": "EMISSAO_GEE",
              "source_slug": "GHG_PROTOCOL",
              "source": "GHG Protocol — Registro Público de Emissões",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "5055/19",
              "source_url": "https://sistema-registropublicodeemissoesapi.fgv.br/GenerateReport/GenerateInventoryReport/5055/19/true",
              "collected_at": "2026-10-30T13:36:39.946Z",
              "valid_until": "2026-11-29T13:36:39.946Z"
            },
            "weight": 60,
            "weight_reason": null,
            "signal": "POSITIVE",
            "points": 60
          }
        ]
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
        "calculated_at": "2026-10-30T13:36:41.436Z",
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
          "origin": "PERSISTED",
          "evidence_state": "CONFIRMED"
        }
      ],
      "scores_pending": false,
      "retry_after_seconds": null
    }
  }
} satisfies CapturedResponse<GetCompanyProfileResponses, 200>;
