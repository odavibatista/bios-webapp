// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetCompanyProfileResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getCompanyProfile",
  "scenario": "alcoa",
  "description": "Perfil completo: Divisão CNAE 24 (metalurgia de não ferrosos); autos do IBAMA",
  "request": {
    "method": "GET",
    "path": "/companies/23637697000101"
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "cnpj": "23637697000101",
    "legal_name": "ALCOA ALUMINIO S/A",
    "trade_name": null,
    "registration_status": "ATIVA",
    "registration_status_unrecognized": null,
    "company_size": "DEMAIS",
    "address": {
      "street": "RODOVIA POCOS DE CALDAS - ANDRADAS KM 10",
      "number": "S/N",
      "complement": null,
      "neighborhood": "ZONA RURAL",
      "city": "POCOS DE CALDAS",
      "city_ibge_code": "3151800",
      "uf": "MG",
      "zipcode": "37719900"
    },
    "main_cnae": {
      "code": "2441501",
      "description": "PRODUÇÃO DE ALUMÍNIO E SUAS LIGAS EM FORMAS PRIMÁRIAS"
    },
    "secondary_cnaes": [
      {
        "code": "3513100",
        "description": "COMÉRCIO ATACADISTA DE ENERGIA ELÉTRICA"
      },
      {
        "code": "5212500",
        "description": "CARGA E DESCARGA"
      },
      {
        "code": "6810202",
        "description": "ALUGUEL DE IMÓVEIS PRÓPRIOS"
      },
      {
        "code": "8211300",
        "description": "SERVIÇOS COMBINADOS DE ESCRITÓRIO E APOIO ADMINISTRATIVO"
      }
    ],
    "refreshed_at": "2026-10-30T13:32:40.027Z",
    "evidences": [
      {
        "category": "INFRACAO_AMBIENTAL",
        "evidences": [
          {
            "id": "6ae4928a703dbcb483fa9cea",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Multa simples — R$ 1.907,40 (URUACU/GO)",
            "source_reference": "827698-A",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
            "details": {
              "resource": "AUTO_INFRACAO",
              "notice_type": "Multa simples",
              "fine_amount": 1907.4,
              "municipality": "URUACU",
              "municipality_code": "5221601",
              "uf": "GO",
              "process_number": "02010.004214/1989-30",
              "status": "Lavrado"
            },
            "published_at": "1989-08-02T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          },
          {
            "id": "6ae4928a703dbcb483fa9d30",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Multa simples: Transportar produto florestal sem cobertura de ATPF ou com ATPF invalidada (vencida ou falsificada) — R$ 1.502,80 (URUACU/GO)",
            "source_reference": "827755-A",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
            "details": {
              "resource": "AUTO_INFRACAO",
              "notice_type": "Multa simples",
              "infraction_type": "Flora",
              "infraction_code": "403001",
              "infraction_description": "Transportar produto florestal sem cobertura de ATPF ou com ATPF invalidada (vencida ou falsificada)",
              "fine_amount": 1502.8,
              "municipality": "URUACU",
              "municipality_code": "5221601",
              "uf": "GO",
              "process_number": "02010.004214/1989-30",
              "status": "Lavrado"
            },
            "published_at": "1989-07-20T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          },
          {
            "id": "6ae4928a703dbcb483fa9d47",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Multa simples: Transportar produto florestal sem cobertura de ATPF ou com ATPF invalidada (vencida ou falsificada) — R$ 1.358,30 (URUACU/GO)",
            "source_reference": "831062-A",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
            "details": {
              "resource": "AUTO_INFRACAO",
              "notice_type": "Multa simples",
              "infraction_type": "Flora",
              "infraction_code": "403001",
              "infraction_description": "Transportar produto florestal sem cobertura de ATPF ou com ATPF invalidada (vencida ou falsificada)",
              "fine_amount": 1358.3,
              "municipality": "URUACU",
              "municipality_code": "5221601",
              "uf": "GO",
              "process_number": "02010.004214/1989-30",
              "status": "Lavrado"
            },
            "published_at": "1989-07-21T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          },
          {
            "id": "6ae4928a703dbcb483fa9db1",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Multa simples — R$ 1.392,00 (URUACU/GO)",
            "source_reference": "832685-A",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
            "details": {
              "resource": "AUTO_INFRACAO",
              "notice_type": "Multa simples",
              "fine_amount": 1392,
              "municipality": "URUACU",
              "municipality_code": "5221601",
              "uf": "GO",
              "process_number": "02010.004214/1989-30",
              "status": "Lavrado"
            },
            "published_at": "1989-08-03T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          },
          {
            "id": "6ae4928a703dbcb483fa9db7",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Multa simples — R$ 1.184,90 (URUACU/GO)",
            "source_reference": "832712-A",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
            "details": {
              "resource": "AUTO_INFRACAO",
              "notice_type": "Multa simples",
              "fine_amount": 1184.9,
              "municipality": "URUACU",
              "municipality_code": "5221601",
              "uf": "GO",
              "process_number": "02010.004214/1989-30",
              "status": "Lavrado"
            },
            "published_at": "1989-07-23T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          },
          {
            "id": "6ae4928a703dbcb483fa9e44",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Multa simples — R$ 1.502,80 (URUACU/GO)",
            "source_reference": "836142-A",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
            "details": {
              "resource": "AUTO_INFRACAO",
              "notice_type": "Multa simples",
              "fine_amount": 1502.8,
              "municipality": "URUACU",
              "municipality_code": "5221601",
              "uf": "GO",
              "process_number": "02010.004214/1989-30",
              "status": "Lavrado"
            },
            "published_at": "1989-07-20T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          }
        ]
      },
      {
        "category": "CONDUTA_ADMINISTRATIVA",
        "evidences": [
          {
            "id": "6ae49c780f3f8176322f9644",
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
            "collected_at": "2026-10-30T13:32:40.197Z",
            "valid_until": "2026-10-31T13:32:40.197Z"
          },
          {
            "id": "6ae49c780f3f8176322f9641",
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
            "collected_at": "2026-10-30T13:32:40.197Z",
            "valid_until": "2026-10-31T13:32:40.197Z"
          }
        ]
      },
      {
        "category": "EMISSAO_GEE",
        "evidences": [
          {
            "id": "6ae49c780f3f8176322f963d",
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
            "collected_at": "2026-10-30T13:32:44.296Z",
            "valid_until": "2026-10-30T13:47:44.296Z"
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
        "calculated_at": "2026-10-30T13:37:58.034Z",
        "contributions": []
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
          "origin": "UNAVAILABLE",
          "evidence_state": "UNKNOWN"
        }
      ],
      "scores_pending": false,
      "retry_after_seconds": 900
    }
  }
} satisfies CapturedResponse<GetCompanyProfileResponses, 200>;
