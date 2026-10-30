// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetScoreExplanationResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getScoreExplanation",
  "scenario": "alcoa-ods-15",
  "description": "Explicação do índice do ODS 15",
  "request": {
    "method": "GET",
    "path": "/companies/23637697000101/scores/15/explanation"
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "cnpj": "23637697000101",
    "ods_number": 15,
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
    "calculated_at": "2026-10-30T13:37:58.034Z",
    "contributions": [
      {
        "evidence": {
          "id": "6ae4928a703dbcb483fa9cea",
          "category": "INFRACAO_AMBIENTAL",
          "source_slug": "IBAMA",
          "source": "IBAMA — Dados Abertos",
          "state": "CONFIRMED",
          "current_state": "CONFIRMED",
          "source_reference": "827698-A",
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
          "id": "6ae4928a703dbcb483fa9d30",
          "category": "INFRACAO_AMBIENTAL",
          "source_slug": "IBAMA",
          "source": "IBAMA — Dados Abertos",
          "state": "CONFIRMED",
          "current_state": "CONFIRMED",
          "source_reference": "827755-A",
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
          "id": "6ae4928a703dbcb483fa9d47",
          "category": "INFRACAO_AMBIENTAL",
          "source_slug": "IBAMA",
          "source": "IBAMA — Dados Abertos",
          "state": "CONFIRMED",
          "current_state": "CONFIRMED",
          "source_reference": "831062-A",
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
          "id": "6ae4928a703dbcb483fa9db1",
          "category": "INFRACAO_AMBIENTAL",
          "source_slug": "IBAMA",
          "source": "IBAMA — Dados Abertos",
          "state": "CONFIRMED",
          "current_state": "CONFIRMED",
          "source_reference": "832685-A",
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
          "id": "6ae4928a703dbcb483fa9db7",
          "category": "INFRACAO_AMBIENTAL",
          "source_slug": "IBAMA",
          "source": "IBAMA — Dados Abertos",
          "state": "CONFIRMED",
          "current_state": "CONFIRMED",
          "source_reference": "832712-A",
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
          "id": "6ae4928a703dbcb483fa9e44",
          "category": "INFRACAO_AMBIENTAL",
          "source_slug": "IBAMA",
          "source": "IBAMA — Dados Abertos",
          "state": "CONFIRMED",
          "current_state": "CONFIRMED",
          "source_reference": "836142-A",
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
} satisfies CapturedResponse<GetScoreExplanationResponses, 200>;
