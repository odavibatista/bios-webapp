// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetCompanyProfileResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getCompanyProfile",
  "scenario": "usiminas",
  "description": "Perfil completo: Divisão CNAE 24; autos do IBAMA e inventário de emissões confirmado no GHG Protocol",
  "request": {
    "method": "GET",
    "path": "/companies/60894730000105"
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "cnpj": "60894730000105",
    "legal_name": "USINAS SIDERURGICAS DE MINAS GERAIS S/A. USIMINAS",
    "trade_name": null,
    "registration_status": "ATIVA",
    "registration_status_unrecognized": null,
    "company_size": "DEMAIS",
    "address": {
      "street": "AVENIDA DO CONTORNO",
      "number": "6594",
      "complement": "ANDAR 11",
      "neighborhood": "SAVASSI",
      "city": "BELO HORIZONTE",
      "city_ibge_code": "3106200",
      "uf": "MG",
      "zipcode": "30110044"
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
    "refreshed_at": "2026-10-30T13:15:48.675Z",
    "evidences": [
      {
        "category": "INFRACAO_AMBIENTAL",
        "evidences": [
          {
            "id": "6ae49591703dbcb48300abf7",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Multa simples: Infração do CTF(Não Classificada-Móvel) — R$ 1.300,00 (CAMPINAS/SP)",
            "source_reference": "9102250-E",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
            "details": {
              "resource": "AUTO_INFRACAO",
              "notice_type": "Multa simples",
              "infraction_type": "Cadastro Técnico Federal",
              "infraction_code": "910000",
              "infraction_description": "Infração do CTF(Não Classificada-Móvel)",
              "fine_amount": 1300,
              "biomes": "Mata Atlantica",
              "municipality": "CAMPINAS",
              "municipality_code": "3509502",
              "uf": "SP",
              "process_number": "02285.000482/2015-79",
              "status": "Lavrado"
            },
            "published_at": "2015-11-12T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          },
          {
            "id": "6ae495f8703dbcb483018d73",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Multa simples: Infração do CTF(Não Classificada-Móvel) — R$ 6.000,00 (BELO HORIZONTE/MG)",
            "source_reference": "9148415-E",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
            "details": {
              "resource": "AUTO_INFRACAO",
              "notice_type": "Multa simples",
              "infraction_type": "Cadastro Técnico Federal",
              "infraction_code": "910000",
              "infraction_description": "Infração do CTF(Não Classificada-Móvel)",
              "fine_amount": 6000,
              "biomes": "Cerrado",
              "municipality": "BELO HORIZONTE",
              "municipality_code": "3106200",
              "uf": "MG",
              "process_number": "02015.001567/2019-88",
              "status": "Lavrado"
            },
            "published_at": "2019-03-07T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          },
          {
            "id": "6ae495f8703dbcb483018d78",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Multa simples: Infração do CTF(Não Classificada-Móvel) — R$ 6.000,00 (BELO HORIZONTE/MG)",
            "source_reference": "9148416-E",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
            "details": {
              "resource": "AUTO_INFRACAO",
              "notice_type": "Multa simples",
              "infraction_type": "Cadastro Técnico Federal",
              "infraction_code": "910000",
              "infraction_description": "Infração do CTF(Não Classificada-Móvel)",
              "fine_amount": 6000,
              "biomes": "Cerrado",
              "municipality": "BELO HORIZONTE",
              "municipality_code": "3106200",
              "uf": "MG",
              "process_number": "02015.001570/2019-00",
              "status": "Lavrado"
            },
            "published_at": "2019-03-07T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          },
          {
            "id": "6ae49602703dbcb48301a3c1",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Multa simples: Infração do CTF(Não Classificada-Móvel) — R$ 6.000,00 (BELO HORIZONTE/MG)",
            "source_reference": "9216821-E",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
            "details": {
              "resource": "AUTO_INFRACAO",
              "notice_type": "Multa simples",
              "infraction_type": "Cadastro Técnico Federal",
              "infraction_code": "910000",
              "infraction_description": "Infração do CTF(Não Classificada-Móvel)",
              "fine_amount": 6000,
              "biomes": "Cerrado",
              "municipality": "BELO HORIZONTE",
              "municipality_code": "3106200",
              "uf": "MG",
              "process_number": "02015.001571/2019-46",
              "status": "Lavrado"
            },
            "published_at": "2019-03-07T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          },
          {
            "id": "6ae49602703dbcb48301a3ba",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Multa simples: Infração do CTF(Não Classificada-Móvel) — R$ 6.000,00 (BELO HORIZONTE/MG)",
            "source_reference": "9216822-E",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
            "details": {
              "resource": "AUTO_INFRACAO",
              "notice_type": "Multa simples",
              "infraction_type": "Cadastro Técnico Federal",
              "infraction_code": "910000",
              "infraction_description": "Infração do CTF(Não Classificada-Móvel)",
              "fine_amount": 6000,
              "biomes": "Cerrado",
              "municipality": "BELO HORIZONTE",
              "municipality_code": "3106200",
              "uf": "MG",
              "process_number": "02015.001574/2019-80",
              "status": "Lavrado"
            },
            "published_at": "2019-03-07T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          },
          {
            "id": "6ae49602703dbcb48301a3bc",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Multa simples: Infração do CTF(Não Classificada-Móvel) — R$ 6.000,00 (BELO HORIZONTE/MG)",
            "source_reference": "9216824-E",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
            "details": {
              "resource": "AUTO_INFRACAO",
              "notice_type": "Multa simples",
              "infraction_type": "Cadastro Técnico Federal",
              "infraction_code": "910000",
              "infraction_description": "Infração do CTF(Não Classificada-Móvel)",
              "fine_amount": 6000,
              "biomes": "Cerrado",
              "municipality": "BELO HORIZONTE",
              "municipality_code": "3106200",
              "uf": "MG",
              "process_number": "02015.001575/2019-24",
              "status": "Lavrado"
            },
            "published_at": "2019-03-07T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          }
        ]
      },
      {
        "category": "CONDUTA_ADMINISTRATIVA",
        "evidences": [
          {
            "id": "6ae498850f3f8176322d3caf",
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
            "collected_at": "2026-10-30T13:15:48.945Z",
            "valid_until": "2026-10-31T13:15:48.945Z"
          },
          {
            "id": "6ae498850f3f8176322d3c9d",
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
            "collected_at": "2026-10-30T13:15:48.946Z",
            "valid_until": "2026-10-31T13:15:48.946Z"
          }
        ]
      },
      {
        "category": "EMISSAO_GEE",
        "evidences": [
          {
            "id": "6ae498870f3f8176322d3e67",
            "source_slug": "GHG_PROTOCOL",
            "source": "GHG Protocol — Registro Público de Emissões",
            "ods_number": 13,
            "state": "CONFIRMED",
            "signal": "POSITIVE",
            "summary": "Inventário de emissões de GEE publicado: ano 2025.",
            "source_reference": "3268/19",
            "source_url": "https://sistema-registropublicodeemissoesapi.fgv.br/GenerateReport/GenerateInventoryReport/3268/19/true",
            "details": {
              "organizationId": 3268,
              "cycleId": 19,
              "inventoryYear": 2025
            },
            "published_at": null,
            "collected_at": "2026-10-30T13:15:48.933Z",
            "valid_until": "2026-11-29T13:15:48.933Z"
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
        "calculated_at": "2026-10-30T13:37:56.256Z",
        "contributions": [
          {
            "evidence": {
              "id": "6ae498870f3f8176322d3e67",
              "category": "EMISSAO_GEE",
              "source_slug": "GHG_PROTOCOL",
              "source": "GHG Protocol — Registro Público de Emissões",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "3268/19",
              "source_url": "https://sistema-registropublicodeemissoesapi.fgv.br/GenerateReport/GenerateInventoryReport/3268/19/true",
              "collected_at": "2026-10-30T13:15:48.933Z",
              "valid_until": "2026-11-29T13:15:48.933Z"
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
        "score_value": -80,
        "confidence_value": 0.75,
        "evidence_count": 6,
        "coverage_status": "HAS_RECORDS",
        "sources_without_records": [
          "CGU_CEIS",
          "CGU_CNEP"
        ],
        "rules_version": "rf10-rf11-v3",
        "calculated_at": "2026-10-30T13:37:56.256Z",
        "contributions": [
          {
            "evidence": {
              "id": "6ae49591703dbcb48300abf7",
              "category": "INFRACAO_AMBIENTAL",
              "source_slug": "IBAMA",
              "source": "IBAMA — Dados Abertos",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "9102250-E",
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
              "id": "6ae495f8703dbcb483018d73",
              "category": "INFRACAO_AMBIENTAL",
              "source_slug": "IBAMA",
              "source": "IBAMA — Dados Abertos",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "9148415-E",
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
              "id": "6ae495f8703dbcb483018d78",
              "category": "INFRACAO_AMBIENTAL",
              "source_slug": "IBAMA",
              "source": "IBAMA — Dados Abertos",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "9148416-E",
              "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
              "collected_at": "2026-10-30T12:49:25.354Z",
              "valid_until": "2026-11-01T12:49:25.354Z"
            },
            "weight": 40,
            "weight_reason": null,
            "signal": "NEGATIVE",
            "points": 0
          },
          {
            "evidence": {
              "id": "6ae49602703dbcb48301a3c1",
              "category": "INFRACAO_AMBIENTAL",
              "source_slug": "IBAMA",
              "source": "IBAMA — Dados Abertos",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "9216821-E",
              "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
              "collected_at": "2026-10-30T12:49:25.354Z",
              "valid_until": "2026-11-01T12:49:25.354Z"
            },
            "weight": 40,
            "weight_reason": null,
            "signal": "NEGATIVE",
            "points": 0
          },
          {
            "evidence": {
              "id": "6ae49602703dbcb48301a3ba",
              "category": "INFRACAO_AMBIENTAL",
              "source_slug": "IBAMA",
              "source": "IBAMA — Dados Abertos",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "9216822-E",
              "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
              "collected_at": "2026-10-30T12:49:25.354Z",
              "valid_until": "2026-11-01T12:49:25.354Z"
            },
            "weight": 40,
            "weight_reason": null,
            "signal": "NEGATIVE",
            "points": 0
          },
          {
            "evidence": {
              "id": "6ae49602703dbcb48301a3bc",
              "category": "INFRACAO_AMBIENTAL",
              "source_slug": "IBAMA",
              "source": "IBAMA — Dados Abertos",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "9216824-E",
              "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
              "collected_at": "2026-10-30T12:49:25.354Z",
              "valid_until": "2026-11-01T12:49:25.354Z"
            },
            "weight": 40,
            "weight_reason": null,
            "signal": "NEGATIVE",
            "points": 0
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
