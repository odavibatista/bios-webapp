// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetCompanyProfileResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getCompanyProfile",
  "scenario": "atuante",
  "description": "Perfil completo: Sanções vigentes no CEIS e no CNEP; situação cadastral inapta",
  "request": {
    "method": "GET",
    "path": "/companies/33458350000155"
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "cnpj": "33458350000155",
    "legal_name": "ATUANTE ALIMENTOS LTDA",
    "trade_name": "ATUANTE ALIMENTOS",
    "registration_status": "INAPTA",
    "registration_status_unrecognized": null,
    "company_size": "DEMAIS",
    "address": {
      "street": "RUA CABO FRIO",
      "number": "S/N",
      "complement": "QUADRA04 LOTE 05",
      "neighborhood": "RES JARDIM LEBLON",
      "city": "GOIANIA",
      "city_ibge_code": "5208707",
      "uf": "GO",
      "zipcode": "74455371"
    },
    "main_cnae": {
      "code": "4729699",
      "description": "COMÉRCIO VAREJISTA DE PRODUTOS ALIMENTÍCIOS EM GERAL OU ESPECIALIZADO EM PRODUTOS ALIMENTÍCIOS NÃO ESPECIFICADOS ANTERIORMENTE"
    },
    "secondary_cnaes": [
      {
        "code": "4646002",
        "description": "COMÉRCIO ATACADISTA DE PRODUTOS DE HIGIENE PESSOAL"
      },
      {
        "code": "4721102",
        "description": "PADARIA E CONFEITARIA COM PREDOMINÂNCIA DE REVENDA"
      },
      {
        "code": "4721103",
        "description": "COMÉRCIO VAREJISTA DE LATICÍNIOS E FRIOS"
      },
      {
        "code": "4722901",
        "description": "COMÉRCIO VAREJISTA DE CARNES - AÇOUGUES"
      },
      {
        "code": "4724500",
        "description": "COMÉRCIO VAREJISTA DE HORTIFRUTIGRANJEIROS"
      },
      {
        "code": "4751201",
        "description": "COMÉRCIO VAREJISTA ESPECIALIZADO DE EQUIPAMENTOS E SUPRIMENTOS DE INFORMÁTICA"
      },
      {
        "code": "4754701",
        "description": "COMÉRCIO VAREJISTA DE MÓVEIS"
      },
      {
        "code": "4754702",
        "description": "COMÉRCIO VAREJISTA DE ARTIGOS DE COLCHOARIA"
      },
      {
        "code": "4754703",
        "description": "COMÉRCIO VAREJISTA DE ARTIGOS DE ILUMINAÇÃO"
      },
      {
        "code": "4756300",
        "description": "COMÉRCIO VAREJISTA ESPECIALIZADO DE INSTRUMENTOS MUSICAIS E ACESSÓRIOS"
      },
      {
        "code": "4761003",
        "description": "COMÉRCIO VAREJISTA DE ARTIGOS DE PAPELARIA"
      },
      {
        "code": "4763601",
        "description": "COMÉRCIO VAREJISTA DE BRINQUEDOS E ARTIGOS RECREATIVOS"
      },
      {
        "code": "4763602",
        "description": "COMÉRCIO VAREJISTA DE ARTIGOS ESPORTIVOS"
      },
      {
        "code": "4763604",
        "description": "COMÉRCIO VAREJISTA DE ARTIGOS DE CAÇA, PESCA E CAMPING"
      },
      {
        "code": "4772500",
        "description": "COMÉRCIO VAREJISTA DE COSMÉTICOS, PRODUTOS DE PERFUMARIA E DE HIGIENE PESSOAL"
      },
      {
        "code": "4789005",
        "description": "COMÉRCIO VAREJISTA DE PRODUTOS SANEANTES DOMISSANITÁRIOS"
      },
      {
        "code": "4789007",
        "description": "COMÉRCIO VAREJISTA DE EQUIPAMENTOS PARA ESCRITÓRIO"
      },
      {
        "code": "9511800",
        "description": "REPARAÇÃO E MANUTENÇÃO DE COMPUTADORES E DE EQUIPAMENTOS PERIFÉRICOS"
      }
    ],
    "refreshed_at": "2026-10-30T13:32:48.446Z",
    "evidences": [
      {
        "category": "INFRACAO_AMBIENTAL",
        "evidences": [
          {
            "id": "6ae49c800f3f8176322f967f",
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
            "id": "6ae49c810f3f8176322f9690",
            "source_slug": "CGU_CEIS",
            "source": "CGU — Cadastro de Empresas Inidôneas e Suspensas (CEIS)",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Sanção administrativa registrada no CEIS",
            "source_reference": "347062",
            "source_url": "https://api.portaldatransparencia.gov.br/api-de-dados/ceis/347062",
            "details": {
              "id": "347062",
              "cnpj": "33458350000155",
              "authority": "Secretaria da Educação do Estado de Goiás - SEDUC",
              "sanctionType": "Declaração de Inidoneidade com prazo determinado",
              "startDate": "2025-03-13",
              "endDate": "2028-03-13",
              "publicationDate": "2025-03-13"
            },
            "published_at": "2025-03-13T00:00:00.000Z",
            "collected_at": "2026-10-30T13:32:48.597Z",
            "valid_until": "2026-10-31T13:32:48.597Z"
          },
          {
            "id": "6ae49c810f3f8176322f9692",
            "source_slug": "CGU_CEIS",
            "source": "CGU — Cadastro de Empresas Inidôneas e Suspensas (CEIS)",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Sanção administrativa registrada no CEIS",
            "source_reference": "363704",
            "source_url": "https://api.portaldatransparencia.gov.br/api-de-dados/ceis/363704",
            "details": {
              "id": "363704",
              "cnpj": "33458350000155",
              "authority": "Secretaria da Educação do Estado de Goiás - SEDUC",
              "sanctionType": "Declaração de Inidoneidade com prazo determinado",
              "startDate": "2025-09-22",
              "endDate": "2027-09-22",
              "publicationDate": "2025-09-03"
            },
            "published_at": "2025-09-03T00:00:00.000Z",
            "collected_at": "2026-10-30T13:32:48.597Z",
            "valid_until": "2026-10-31T13:32:48.597Z"
          },
          {
            "id": "6ae49c810f3f8176322f968f",
            "source_slug": "CGU_CEIS",
            "source": "CGU — Cadastro de Empresas Inidôneas e Suspensas (CEIS)",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Sanção administrativa registrada no CEIS",
            "source_reference": "405977",
            "source_url": "https://api.portaldatransparencia.gov.br/api-de-dados/ceis/405977",
            "details": {
              "id": "405977",
              "cnpj": "33458350000155",
              "authority": "Tribunal de Contas do Estado de Goiás",
              "sanctionType": "Declaração de Inidoneidade com prazo determinado",
              "startDate": "2025-08-26",
              "endDate": "2028-08-25",
              "publicationDate": "2025-07-01"
            },
            "published_at": "2025-07-01T00:00:00.000Z",
            "collected_at": "2026-10-30T13:32:48.597Z",
            "valid_until": "2026-10-31T13:32:48.597Z"
          },
          {
            "id": "6ae49c810f3f8176322f9691",
            "source_slug": "CGU_CEIS",
            "source": "CGU — Cadastro de Empresas Inidôneas e Suspensas (CEIS)",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Sanção administrativa registrada no CEIS",
            "source_reference": "405984",
            "source_url": "https://api.portaldatransparencia.gov.br/api-de-dados/ceis/405984",
            "details": {
              "id": "405984",
              "cnpj": "33458350000155",
              "authority": "Tribunal de Contas do Estado de Goiás",
              "sanctionType": "Declaração de Inidoneidade com prazo determinado",
              "startDate": "2025-06-24",
              "endDate": "2028-06-23",
              "publicationDate": "2025-03-18"
            },
            "published_at": "2025-03-18T00:00:00.000Z",
            "collected_at": "2026-10-30T13:32:48.597Z",
            "valid_until": "2026-10-31T13:32:48.597Z"
          },
          {
            "id": "6ae49c800f3f8176322f9687",
            "source_slug": "CGU_CNEP",
            "source": "CGU — Cadastro Nacional de Empresas Punidas (CNEP)",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Sanção administrativa registrada no CNEP",
            "source_reference": "405977",
            "source_url": "https://api.portaldatransparencia.gov.br/api-de-dados/cnep/405977",
            "details": {
              "id": "405977",
              "cnpj": "33458350000155",
              "authority": "Tribunal de Contas do Estado de Goiás",
              "sanctionType": "Declaração de Inidoneidade com prazo determinado",
              "startDate": "2025-08-26",
              "endDate": "2028-08-25",
              "publicationDate": "2025-07-01"
            },
            "published_at": "2025-07-01T00:00:00.000Z",
            "collected_at": "2026-10-30T13:32:48.597Z",
            "valid_until": "2026-10-31T13:32:48.597Z"
          },
          {
            "id": "6ae49c800f3f8176322f9688",
            "source_slug": "CGU_CNEP",
            "source": "CGU — Cadastro Nacional de Empresas Punidas (CNEP)",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Sanção administrativa registrada no CNEP",
            "source_reference": "405984",
            "source_url": "https://api.portaldatransparencia.gov.br/api-de-dados/cnep/405984",
            "details": {
              "id": "405984",
              "cnpj": "33458350000155",
              "authority": "Tribunal de Contas do Estado de Goiás",
              "sanctionType": "Declaração de Inidoneidade com prazo determinado",
              "startDate": "2025-06-24",
              "endDate": "2028-06-23",
              "publicationDate": "2025-03-18"
            },
            "published_at": "2025-03-18T00:00:00.000Z",
            "collected_at": "2026-10-30T13:32:48.597Z",
            "valid_until": "2026-10-31T13:32:48.597Z"
          }
        ]
      },
      {
        "category": "EMISSAO_GEE",
        "evidences": [
          {
            "id": "6ae49c800f3f8176322f967d",
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
            "collected_at": "2026-10-30T13:32:48.576Z",
            "valid_until": "2026-10-30T13:47:48.576Z"
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
        "calculated_at": "2026-10-30T13:37:58.784Z",
        "contributions": []
      },
      {
        "ods_number": 15,
        "calculation_status": "CALCULATED",
        "index_status": "AVAILABLE",
        "score_value": -20,
        "confidence_value": 0.6122448979591837,
        "evidence_count": 6,
        "coverage_status": "HAS_RECORDS",
        "sources_without_records": [
          "IBAMA"
        ],
        "rules_version": "rf10-rf11-v3",
        "calculated_at": "2026-10-30T13:37:58.784Z",
        "contributions": [
          {
            "evidence": {
              "id": "6ae49c810f3f8176322f9690",
              "category": "CONDUTA_ADMINISTRATIVA",
              "source_slug": "CGU_CEIS",
              "source": "CGU — Cadastro de Empresas Inidôneas e Suspensas (CEIS)",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "347062",
              "source_url": "https://api.portaldatransparencia.gov.br/api-de-dados/ceis/347062",
              "collected_at": "2026-10-30T13:32:48.597Z",
              "valid_until": "2026-10-31T13:32:48.597Z"
            },
            "weight": 5,
            "weight_reason": null,
            "signal": "NEGATIVE",
            "points": -5
          },
          {
            "evidence": {
              "id": "6ae49c810f3f8176322f9692",
              "category": "CONDUTA_ADMINISTRATIVA",
              "source_slug": "CGU_CEIS",
              "source": "CGU — Cadastro de Empresas Inidôneas e Suspensas (CEIS)",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "363704",
              "source_url": "https://api.portaldatransparencia.gov.br/api-de-dados/ceis/363704",
              "collected_at": "2026-10-30T13:32:48.597Z",
              "valid_until": "2026-10-31T13:32:48.597Z"
            },
            "weight": 5,
            "weight_reason": null,
            "signal": "NEGATIVE",
            "points": -5
          },
          {
            "evidence": {
              "id": "6ae49c810f3f8176322f968f",
              "category": "CONDUTA_ADMINISTRATIVA",
              "source_slug": "CGU_CEIS",
              "source": "CGU — Cadastro de Empresas Inidôneas e Suspensas (CEIS)",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "405977",
              "source_url": "https://api.portaldatransparencia.gov.br/api-de-dados/ceis/405977",
              "collected_at": "2026-10-30T13:32:48.597Z",
              "valid_until": "2026-10-31T13:32:48.597Z"
            },
            "weight": 5,
            "weight_reason": null,
            "signal": "NEGATIVE",
            "points": -5
          },
          {
            "evidence": {
              "id": "6ae49c810f3f8176322f9691",
              "category": "CONDUTA_ADMINISTRATIVA",
              "source_slug": "CGU_CEIS",
              "source": "CGU — Cadastro de Empresas Inidôneas e Suspensas (CEIS)",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "405984",
              "source_url": "https://api.portaldatransparencia.gov.br/api-de-dados/ceis/405984",
              "collected_at": "2026-10-30T13:32:48.597Z",
              "valid_until": "2026-10-31T13:32:48.597Z"
            },
            "weight": 5,
            "weight_reason": null,
            "signal": "NEGATIVE",
            "points": -5
          },
          {
            "evidence": {
              "id": "6ae49c800f3f8176322f9687",
              "category": "CONDUTA_ADMINISTRATIVA",
              "source_slug": "CGU_CNEP",
              "source": "CGU — Cadastro Nacional de Empresas Punidas (CNEP)",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "405977",
              "source_url": "https://api.portaldatransparencia.gov.br/api-de-dados/cnep/405977",
              "collected_at": "2026-10-30T13:32:48.597Z",
              "valid_until": "2026-10-31T13:32:48.597Z"
            },
            "weight": 5,
            "weight_reason": null,
            "signal": "NEGATIVE",
            "points": 0
          },
          {
            "evidence": {
              "id": "6ae49c800f3f8176322f9688",
              "category": "CONDUTA_ADMINISTRATIVA",
              "source_slug": "CGU_CNEP",
              "source": "CGU — Cadastro Nacional de Empresas Punidas (CNEP)",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "405984",
              "source_url": "https://api.portaldatransparencia.gov.br/api-de-dados/cnep/405984",
              "collected_at": "2026-10-30T13:32:48.597Z",
              "valid_until": "2026-10-31T13:32:48.597Z"
            },
            "weight": 5,
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
          "evidence_state": "CONFIRMED"
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
