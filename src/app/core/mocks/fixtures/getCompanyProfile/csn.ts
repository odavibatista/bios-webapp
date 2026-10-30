// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetCompanyProfileResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getCompanyProfile",
  "scenario": "csn",
  "description": "Perfil completo: Divisão CNAE 24; auto do IBAMA e inventário de emissões confirmado no GHG Protocol",
  "request": {
    "method": "GET",
    "path": "/companies/33042730000104"
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "cnpj": "33042730000104",
    "legal_name": "COMPANHIA SIDERURGICA NACIONAL",
    "trade_name": "COMPANHIA SIDERURGICA NACIONAL",
    "registration_status": "ATIVA",
    "registration_status_unrecognized": null,
    "company_size": "DEMAIS",
    "address": {
      "street": "AVENIDA BRIGADEIRO FARIA LIMA",
      "number": "3400",
      "complement": "ANDAR 19 E 20",
      "neighborhood": "ITAIM BIBI",
      "city": "SAO PAULO",
      "city_ibge_code": "3550308",
      "uf": "SP",
      "zipcode": "04538132"
    },
    "main_cnae": {
      "code": "2422901",
      "description": "PRODUÇÃO DE LAMINADOS PLANOS DE AÇO AO CARBONO, REVESTIDOS OU NÃO"
    },
    "secondary_cnaes": [
      {
        "code": "8211300",
        "description": "SERVIÇOS COMBINADOS DE ESCRITÓRIO E APOIO ADMINISTRATIVO"
      }
    ],
    "refreshed_at": "2026-10-30T13:26:53.342Z",
    "evidences": [
      {
        "category": "INFRACAO_AMBIENTAL",
        "evidences": [
          {
            "id": "6ae49646703dbcb48302339e",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Multa simples: Infração de Administração Ambiental(Não Classificada-Móvel) — R$ 1.300,00 (CAMPINAS/SP)",
            "source_reference": "LA9N9BC3",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
            "details": {
              "resource": "AUTO_INFRACAO",
              "notice_type": "Multa simples",
              "infraction_type": "Administração Ambiental",
              "infraction_code": "910004",
              "infraction_description": "Infração de Administração Ambiental(Não Classificada-Móvel)",
              "severity": "Baixa",
              "fine_amount": 1300,
              "biomes": "Mata Atlantica",
              "municipality": "CAMPINAS",
              "municipality_code": "3509502",
              "uf": "SP",
              "process_number": "02285.001029/2023-90",
              "status": "Lavrado",
              "fact_date": "2023-04-11"
            },
            "published_at": "2023-04-19T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          }
        ]
      },
      {
        "category": "CONDUTA_ADMINISTRATIVA",
        "evidences": [
          {
            "id": "6ae49b1d0f3f8176322efbbd",
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
            "collected_at": "2026-10-30T13:26:53.545Z",
            "valid_until": "2026-10-31T13:26:53.545Z"
          },
          {
            "id": "6ae49b1d0f3f8176322efbad",
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
            "collected_at": "2026-10-30T13:26:53.545Z",
            "valid_until": "2026-10-31T13:26:53.545Z"
          }
        ]
      },
      {
        "category": "EMISSAO_GEE",
        "evidences": [
          {
            "id": "6ae49b200f3f8176322efd67",
            "source_slug": "GHG_PROTOCOL",
            "source": "GHG Protocol — Registro Público de Emissões",
            "ods_number": 13,
            "state": "CONFIRMED",
            "signal": "POSITIVE",
            "summary": "Inventário de emissões de GEE publicado: ano 2025.",
            "source_reference": "166/19",
            "source_url": "https://sistema-registropublicodeemissoesapi.fgv.br/GenerateReport/GenerateInventoryReport/166/19/true",
            "details": {
              "organizationId": 166,
              "cycleId": 19,
              "inventoryYear": 2025
            },
            "published_at": null,
            "collected_at": "2026-10-30T13:26:53.520Z",
            "valid_until": "2026-11-29T13:26:53.520Z"
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
        "calculated_at": "2026-10-30T13:37:56.539Z",
        "contributions": [
          {
            "evidence": {
              "id": "6ae49b200f3f8176322efd67",
              "category": "EMISSAO_GEE",
              "source_slug": "GHG_PROTOCOL",
              "source": "GHG Protocol — Registro Público de Emissões",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "166/19",
              "source_url": "https://sistema-registropublicodeemissoesapi.fgv.br/GenerateReport/GenerateInventoryReport/166/19/true",
              "collected_at": "2026-10-30T13:26:53.520Z",
              "valid_until": "2026-11-29T13:26:53.520Z"
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
        "index_status": "AVAILABLE",
        "score_value": -40,
        "confidence_value": 0.3333333333333333,
        "evidence_count": 1,
        "coverage_status": "HAS_RECORDS",
        "sources_without_records": [
          "CGU_CEIS",
          "CGU_CNEP"
        ],
        "rules_version": "rf10-rf11-v3",
        "calculated_at": "2026-10-30T13:37:56.539Z",
        "contributions": [
          {
            "evidence": {
              "id": "6ae49646703dbcb48302339e",
              "category": "INFRACAO_AMBIENTAL",
              "source_slug": "IBAMA",
              "source": "IBAMA — Dados Abertos",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "LA9N9BC3",
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
          "origin": "PERSISTED",
          "evidence_state": "CONFIRMED"
        }
      ],
      "scores_pending": false,
      "retry_after_seconds": null
    }
  }
} satisfies CapturedResponse<GetCompanyProfileResponses, 200>;
