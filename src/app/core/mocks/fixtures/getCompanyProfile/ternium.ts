// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetCompanyProfileResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getCompanyProfile",
  "scenario": "ternium",
  "description": "Perfil completo: Divisão CNAE 24; inventário de emissões confirmado no GHG Protocol",
  "request": {
    "method": "GET",
    "path": "/companies/07005330000119"
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "cnpj": "07005330000119",
    "legal_name": "TERNIUM BRASIL LTDA.",
    "trade_name": null,
    "registration_status": "ATIVA",
    "registration_status_unrecognized": null,
    "company_size": "DEMAIS",
    "address": {
      "street": "AVENIDA JOAO XXIII",
      "number": "S/N",
      "complement": null,
      "neighborhood": "SANTA CRUZ",
      "city": "RIO DE JANEIRO",
      "city_ibge_code": "3304557",
      "uf": "RJ",
      "zipcode": "23560352"
    },
    "main_cnae": {
      "code": "2421100",
      "description": "PRODUÇÃO DE SEMI ACABADOS DE AÇO"
    },
    "secondary_cnaes": [
      {
        "code": "3321000",
        "description": "INSTALAÇÃO DE MÁQUINAS E EQUIPAMENTOS INDUSTRIAIS"
      },
      {
        "code": "3511501",
        "description": "GERAÇÃO DE ENERGIA ELÉTRICA"
      },
      {
        "code": "3600601",
        "description": "CAPTAÇÃO, TRATAMENTO E DISTRIBUIÇÃO DE ÁGUA"
      },
      {
        "code": "5222200",
        "description": "TERMINAIS RODOVIÁRIOS E FERROVIÁRIOS"
      },
      {
        "code": "5231102",
        "description": "ATIVIDADES DO OPERADOR PORTUÁRIO"
      },
      {
        "code": "8630503",
        "description": "ATIVIDADE MÉDICA AMBULATORIAL RESTRITA A CONSULTAS"
      }
    ],
    "refreshed_at": "2026-10-30T13:32:38.096Z",
    "evidences": [
      {
        "category": "INFRACAO_AMBIENTAL",
        "evidences": [
          {
            "id": "6ae4945c703dbcb483fe7f78",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Multa simples: Destruir (danificar, desmatar) florestas ou demais formas de vegetações consideradas de preservação permanente (áreas do art. 2º da Lei 4.771/65) — R$ 100.000,00 (RIO DE JANEIRO/RJ)",
            "source_reference": "512869-D",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
            "details": {
              "resource": "AUTO_INFRACAO",
              "notice_type": "Multa simples",
              "infraction_type": "Flora",
              "infraction_code": "452001",
              "infraction_description": "Destruir (danificar, desmatar) florestas ou demais formas de vegetações consideradas de preservação permanente (áreas do art. 2º da Lei 4.771/65)",
              "fine_amount": 100000,
              "municipality": "RIO DE JANEIRO",
              "municipality_code": "3304557",
              "uf": "RJ",
              "process_number": "02022.000010/2008-88",
              "status": "Lavrado"
            },
            "published_at": "2007-12-20T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          },
          {
            "id": "6ae4945e703dbcb483fe82b7",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Multa simples: Infração da Flora(Não Classificada-Móvel) — R$ 100.000,00 (RIO DE JANEIRO/RJ)",
            "source_reference": "531538-D",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
            "details": {
              "resource": "AUTO_INFRACAO",
              "notice_type": "Multa simples",
              "infraction_type": "Flora",
              "infraction_code": "409999",
              "infraction_description": "Infração da Flora(Não Classificada-Móvel)",
              "fine_amount": 100000,
              "area_hectares": 2,
              "municipality": "RIO DE JANEIRO",
              "municipality_code": "3304557",
              "uf": "RJ",
              "process_number": "02022.001195/2008-48",
              "status": "Lavrado"
            },
            "published_at": "2008-03-28T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          },
          {
            "id": "6ae4945e703dbcb483fe82b5",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Multa simples: Infração da Flora(Não Classificada-Móvel) — R$ 50.000,00 (RIO DE JANEIRO/RJ)",
            "source_reference": "531539-D",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
            "details": {
              "resource": "AUTO_INFRACAO",
              "notice_type": "Multa simples",
              "infraction_type": "Flora",
              "infraction_code": "409999",
              "infraction_description": "Infração da Flora(Não Classificada-Móvel)",
              "fine_amount": 50000,
              "area_hectares": 1,
              "municipality": "RIO DE JANEIRO",
              "municipality_code": "3304557",
              "uf": "RJ",
              "process_number": "02022.001193/2008-59",
              "status": "Lavrado"
            },
            "published_at": "2008-03-28T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          },
          {
            "id": "6ae4945e703dbcb483fe82bc",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Multa simples: Infração da Flora(Não Classificada-Móvel) — R$ 50.000,00 (RIO DE JANEIRO/RJ)",
            "source_reference": "531540-D",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
            "details": {
              "resource": "AUTO_INFRACAO",
              "notice_type": "Multa simples",
              "infraction_type": "Flora",
              "infraction_code": "409999",
              "infraction_description": "Infração da Flora(Não Classificada-Móvel)",
              "fine_amount": 50000,
              "municipality": "RIO DE JANEIRO",
              "municipality_code": "3304557",
              "uf": "RJ",
              "process_number": "02022.001192/2008-12",
              "status": "Lavrado"
            },
            "published_at": "2008-03-28T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          },
          {
            "id": "6ae496d7703dbcb483033ff6",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Termo de embargo (Rio de Janeiro/RJ)",
            "source_reference": "487354-C",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-termo-de-embargo",
            "details": {
              "resource": "TERMO_EMBARGO",
              "municipality": "Rio de Janeiro",
              "municipality_code": "3304557",
              "uf": "RJ",
              "process_number": "02022000010200888",
              "status": "Lavrado",
              "infraction_notice": "512869",
              "lifted": false
            },
            "published_at": "2007-12-20T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          }
        ]
      },
      {
        "category": "CONDUTA_ADMINISTRATIVA",
        "evidences": [
          {
            "id": "6ae49c760f3f8176322f9632",
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
            "collected_at": "2026-10-30T13:32:38.350Z",
            "valid_until": "2026-10-31T13:32:38.350Z"
          },
          {
            "id": "6ae49c760f3f8176322f962f",
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
            "collected_at": "2026-10-30T13:32:38.350Z",
            "valid_until": "2026-10-31T13:32:38.350Z"
          }
        ]
      },
      {
        "category": "EMISSAO_GEE",
        "evidences": [
          {
            "id": "6ae49c770f3f8176322f9637",
            "source_slug": "GHG_PROTOCOL",
            "source": "GHG Protocol — Registro Público de Emissões",
            "ods_number": 13,
            "state": "CONFIRMED",
            "signal": "POSITIVE",
            "summary": "Inventário de emissões de GEE publicado: ano 2025.",
            "source_reference": "2043/19",
            "source_url": "https://sistema-registropublicodeemissoesapi.fgv.br/GenerateReport/GenerateInventoryReport/2043/19/true",
            "details": {
              "organizationId": 2043,
              "cycleId": 19,
              "inventoryYear": 2025
            },
            "published_at": null,
            "collected_at": "2026-10-30T13:32:38.327Z",
            "valid_until": "2026-11-29T13:32:38.327Z"
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
        "calculated_at": "2026-10-30T13:37:57.759Z",
        "contributions": [
          {
            "evidence": {
              "id": "6ae49c770f3f8176322f9637",
              "category": "EMISSAO_GEE",
              "source_slug": "GHG_PROTOCOL",
              "source": "GHG Protocol — Registro Público de Emissões",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "2043/19",
              "source_url": "https://sistema-registropublicodeemissoesapi.fgv.br/GenerateReport/GenerateInventoryReport/2043/19/true",
              "collected_at": "2026-10-30T13:32:38.327Z",
              "valid_until": "2026-11-29T13:32:38.327Z"
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
        "confidence_value": 0.7142857142857143,
        "evidence_count": 5,
        "coverage_status": "HAS_RECORDS",
        "sources_without_records": [
          "CGU_CEIS",
          "CGU_CNEP"
        ],
        "rules_version": "rf10-rf11-v3",
        "calculated_at": "2026-10-30T13:37:57.759Z",
        "contributions": [
          {
            "evidence": {
              "id": "6ae4945c703dbcb483fe7f78",
              "category": "INFRACAO_AMBIENTAL",
              "source_slug": "IBAMA",
              "source": "IBAMA — Dados Abertos",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "512869-D",
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
              "id": "6ae4945e703dbcb483fe82b7",
              "category": "INFRACAO_AMBIENTAL",
              "source_slug": "IBAMA",
              "source": "IBAMA — Dados Abertos",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "531538-D",
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
              "id": "6ae4945e703dbcb483fe82b5",
              "category": "INFRACAO_AMBIENTAL",
              "source_slug": "IBAMA",
              "source": "IBAMA — Dados Abertos",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "531539-D",
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
              "id": "6ae4945e703dbcb483fe82bc",
              "category": "INFRACAO_AMBIENTAL",
              "source_slug": "IBAMA",
              "source": "IBAMA — Dados Abertos",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "531540-D",
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
              "id": "6ae496d7703dbcb483033ff6",
              "category": "INFRACAO_AMBIENTAL",
              "source_slug": "IBAMA",
              "source": "IBAMA — Dados Abertos",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "487354-C",
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
