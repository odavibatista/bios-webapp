// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetCompanyProfileResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getCompanyProfile",
  "scenario": "sidermin",
  "description": "Perfil completo: Divisão CNAE 24; autos do IBAMA e inventário de emissões confirmado no GHG Protocol",
  "request": {
    "method": "GET",
    "path": "/companies/04735087000104"
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "cnpj": "04735087000104",
    "legal_name": "SIDERMIN - SIDERURGICA MINEIRA LTDA",
    "trade_name": "SIDERMIN",
    "registration_status": "ATIVA",
    "registration_status_unrecognized": null,
    "company_size": "DEMAIS",
    "address": {
      "street": "RODOVIA BR-040",
      "number": "000",
      "complement": "KM 477",
      "neighborhood": "UNIVERSITARIO",
      "city": "SETE LAGOAS",
      "city_ibge_code": "3167202",
      "uf": "MG",
      "zipcode": "35702372"
    },
    "main_cnae": {
      "code": "2411300",
      "description": "PRODUÇÃO DE FERRO GUSA"
    },
    "secondary_cnaes": [],
    "refreshed_at": "2026-10-30T13:36:37.965Z",
    "evidences": [
      {
        "category": "INFRACAO_AMBIENTAL",
        "evidences": [
          {
            "id": "6ae49509703dbcb483ffaf77",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Multa simples: Receber ou adquirir, para fins comerciais ou industriais, madeira serrada ou em tora, lenha, carvão ou outros produtos de origem vegetal, sem exigir a exibição de licença do vendedor, e sem munir-se da via que deverá acompanhar o produto até final beneficiamento. — R$ 34.500,00 (SETE LAGOAS/MG)",
            "source_reference": "620447-D",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
            "details": {
              "resource": "AUTO_INFRACAO",
              "notice_type": "Multa simples",
              "infraction_type": "Flora",
              "infraction_code": "409904",
              "infraction_description": "Receber ou adquirir, para fins comerciais ou industriais, madeira serrada ou em tora, lenha, carvão ou outros produtos de origem vegetal, sem exigir a exibição de licença do vendedor, e sem munir-se da via que deverá acompanhar o produto até final beneficiamento.",
              "fine_amount": 34500,
              "biomes": "Cerrado",
              "municipality": "SETE LAGOAS",
              "municipality_code": "3167202",
              "uf": "MG",
              "process_number": "02015.005732/2012-02",
              "status": "Lavrado"
            },
            "published_at": "2012-11-26T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          },
          {
            "id": "6ae494f5703dbcb483ff8715",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Multa simples: Vender, expor à venda, ter em depósito, transportar ou guardar madeira, lenha, carvão ou outros produtos de origem vegetal, sem licença válida para todo o tempo da viagem ou do armazenamento, outorgada pela autoridade competente ou em desacordo com a obtida. — R$ 32.060.700,00 (SETE LAGOAS/MG)",
            "source_reference": "642955-D",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
            "details": {
              "resource": "AUTO_INFRACAO",
              "notice_type": "Multa simples",
              "infraction_type": "Flora",
              "infraction_code": "409905",
              "infraction_description": "Vender, expor à venda, ter em depósito, transportar ou guardar madeira, lenha, carvão ou outros produtos de origem vegetal, sem licença válida para todo o tempo da viagem ou do armazenamento, outorgada pela autoridade competente ou em desacordo com a obtida.",
              "fine_amount": 32060700,
              "biomes": "Cerrado",
              "municipality": "SETE LAGOAS",
              "municipality_code": "3167202",
              "uf": "MG",
              "process_number": "02001.004118/2011-93",
              "status": "Lavrado"
            },
            "published_at": "2011-07-22T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          },
          {
            "id": "6ae49535703dbcb4830000e8",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Multa simples: Receber ou adquirir, para fins comerciais ou industriais, madeira serrada ou em tora, lenha, carvão ou outros produtos de origem vegetal, sem exigir a exibição de licença do vendedor, e sem munir-se da via que deverá acompanhar o produto até final beneficiamento. — R$ 6.077.400,00 (SETE LAGOAS/MG)",
            "source_reference": "596900-D",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
            "details": {
              "resource": "AUTO_INFRACAO",
              "notice_type": "Multa simples",
              "infraction_type": "Flora",
              "infraction_code": "409904",
              "infraction_description": "Receber ou adquirir, para fins comerciais ou industriais, madeira serrada ou em tora, lenha, carvão ou outros produtos de origem vegetal, sem exigir a exibição de licença do vendedor, e sem munir-se da via que deverá acompanhar o produto até final beneficiamento.",
              "fine_amount": 6077400,
              "biomes": "Cerrado",
              "municipality": "SETE LAGOAS",
              "municipality_code": "3167202",
              "uf": "MG",
              "process_number": "02015.002030/2013-40",
              "status": "Lavrado"
            },
            "published_at": "2013-07-04T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          },
          {
            "id": "6ae4951b703dbcb483ffd11a",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Multa simples: Receber ou adquirir, para fins comerciais ou industriais, madeira serrada ou em tora, lenha, carvão ou outros produtos de origem vegetal, sem exigir a exibição de licença do vendedor, e sem munir-se da via que deverá acompanhar o produto até final beneficiamento. — R$ 333.000,00 (SETE LAGOAS/MG)",
            "source_reference": "597350-D",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
            "details": {
              "resource": "AUTO_INFRACAO",
              "notice_type": "Multa simples",
              "infraction_type": "Flora",
              "infraction_code": "409904",
              "infraction_description": "Receber ou adquirir, para fins comerciais ou industriais, madeira serrada ou em tora, lenha, carvão ou outros produtos de origem vegetal, sem exigir a exibição de licença do vendedor, e sem munir-se da via que deverá acompanhar o produto até final beneficiamento.",
              "fine_amount": 333000,
              "biomes": "Cerrado",
              "municipality": "SETE LAGOAS",
              "municipality_code": "3167202",
              "uf": "MG",
              "process_number": "02015.005728/2012-36",
              "status": "Lavrado"
            },
            "published_at": "2012-11-26T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          },
          {
            "id": "6ae4954e703dbcb48300337e",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Multa simples: Infração da Flora(Não Classificada-Móvel) — R$ 2.733.000,00 (SETE LAGOAS/MG)",
            "source_reference": "1036-E",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
            "details": {
              "resource": "AUTO_INFRACAO",
              "notice_type": "Multa simples",
              "infraction_type": "Flora",
              "infraction_code": "409999",
              "infraction_description": "Infração da Flora(Não Classificada-Móvel)",
              "fine_amount": 2733000,
              "biomes": "Cerrado",
              "municipality": "SETE LAGOAS",
              "municipality_code": "3167202",
              "uf": "MG",
              "process_number": "02015.001055/2014-15",
              "status": "Lavrado"
            },
            "published_at": "2014-06-07T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          },
          {
            "id": "6ae496b7703dbcb483030392",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Termo de embargo (Sete Lagoas/MG)",
            "source_reference": "2059-E",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-termo-de-embargo",
            "details": {
              "resource": "TERMO_EMBARGO",
              "municipality": "Sete Lagoas",
              "municipality_code": "3167202",
              "uf": "MG",
              "process_number": "02015001055201415",
              "status": "Lavrado",
              "infraction_notice": "1036",
              "lifted": false
            },
            "published_at": "2014-06-07T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          },
          {
            "id": "6ae496c3703dbcb483031a25",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Termo de embargo (Sete Lagoas/MG)",
            "source_reference": "614464-C",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-termo-de-embargo",
            "details": {
              "resource": "TERMO_EMBARGO",
              "municipality": "Sete Lagoas",
              "municipality_code": "3167202",
              "uf": "MG",
              "process_number": "02001004118201193",
              "status": "Lavrado",
              "infraction_notice": "642955",
              "lifted": false
            },
            "published_at": "2011-07-22T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          }
        ]
      },
      {
        "category": "CONDUTA_ADMINISTRATIVA",
        "evidences": [
          {
            "id": "6ae49d660f3f8176322f9718",
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
            "collected_at": "2026-10-30T13:36:38.205Z",
            "valid_until": "2026-10-31T13:36:38.205Z"
          },
          {
            "id": "6ae49d660f3f8176322f9714",
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
            "collected_at": "2026-10-30T13:36:38.205Z",
            "valid_until": "2026-10-31T13:36:38.205Z"
          }
        ]
      },
      {
        "category": "EMISSAO_GEE",
        "evidences": [
          {
            "id": "6ae49d670f3f8176322f971c",
            "source_slug": "GHG_PROTOCOL",
            "source": "GHG Protocol — Registro Público de Emissões",
            "ods_number": 13,
            "state": "CONFIRMED",
            "signal": "POSITIVE",
            "summary": "Inventário de emissões de GEE publicado: ano 2025.",
            "source_reference": "8176/19",
            "source_url": "https://sistema-registropublicodeemissoesapi.fgv.br/GenerateReport/GenerateInventoryReport/8176/19/true",
            "details": {
              "organizationId": 8176,
              "cycleId": 19,
              "inventoryYear": 2025
            },
            "published_at": null,
            "collected_at": "2026-10-30T13:36:38.189Z",
            "valid_until": "2026-11-29T13:36:38.189Z"
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
        "calculated_at": "2026-10-30T13:36:39.217Z",
        "contributions": [
          {
            "evidence": {
              "id": "6ae49d670f3f8176322f971c",
              "category": "EMISSAO_GEE",
              "source_slug": "GHG_PROTOCOL",
              "source": "GHG Protocol — Registro Público de Emissões",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "8176/19",
              "source_url": "https://sistema-registropublicodeemissoesapi.fgv.br/GenerateReport/GenerateInventoryReport/8176/19/true",
              "collected_at": "2026-10-30T13:36:38.189Z",
              "valid_until": "2026-11-29T13:36:38.189Z"
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
        "confidence_value": 0.7777777777777777,
        "evidence_count": 7,
        "coverage_status": "HAS_RECORDS",
        "sources_without_records": [
          "CGU_CEIS",
          "CGU_CNEP"
        ],
        "rules_version": "rf10-rf11-v3",
        "calculated_at": "2026-10-30T13:36:39.217Z",
        "contributions": [
          {
            "evidence": {
              "id": "6ae49509703dbcb483ffaf77",
              "category": "INFRACAO_AMBIENTAL",
              "source_slug": "IBAMA",
              "source": "IBAMA — Dados Abertos",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "620447-D",
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
              "id": "6ae494f5703dbcb483ff8715",
              "category": "INFRACAO_AMBIENTAL",
              "source_slug": "IBAMA",
              "source": "IBAMA — Dados Abertos",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "642955-D",
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
              "id": "6ae49535703dbcb4830000e8",
              "category": "INFRACAO_AMBIENTAL",
              "source_slug": "IBAMA",
              "source": "IBAMA — Dados Abertos",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "596900-D",
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
              "id": "6ae4951b703dbcb483ffd11a",
              "category": "INFRACAO_AMBIENTAL",
              "source_slug": "IBAMA",
              "source": "IBAMA — Dados Abertos",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "597350-D",
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
              "id": "6ae4954e703dbcb48300337e",
              "category": "INFRACAO_AMBIENTAL",
              "source_slug": "IBAMA",
              "source": "IBAMA — Dados Abertos",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "1036-E",
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
              "id": "6ae496b7703dbcb483030392",
              "category": "INFRACAO_AMBIENTAL",
              "source_slug": "IBAMA",
              "source": "IBAMA — Dados Abertos",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "2059-E",
              "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-termo-de-embargo",
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
              "id": "6ae496c3703dbcb483031a25",
              "category": "INFRACAO_AMBIENTAL",
              "source_slug": "IBAMA",
              "source": "IBAMA — Dados Abertos",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "614464-C",
              "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-termo-de-embargo",
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
