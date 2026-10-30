// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetScoreExplanationResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getScoreExplanation",
  "scenario": "sidermin-ods-15",
  "description": "Explicação do índice do ODS 15",
  "request": {
    "method": "GET",
    "path": "/companies/04735087000104/scores/15/explanation"
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "cnpj": "04735087000104",
    "ods_number": 15,
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
} satisfies CapturedResponse<GetScoreExplanationResponses, 200>;
