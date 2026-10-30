// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetCompanyProfileResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getCompanyProfile",
  "scenario": "eccheli",
  "description": "Perfil completo: Sanção vigente no CEIS (conduta administrativa)",
  "request": {
    "method": "GET",
    "path": "/companies/50375702000128"
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "cnpj": "50375702000128",
    "legal_name": "ECCHELI ENGENHARIA LTDA",
    "trade_name": null,
    "registration_status": "ATIVA",
    "registration_status_unrecognized": null,
    "company_size": "EMPRESA DE PEQUENO PORTE",
    "address": {
      "street": "RUA CASTRO FAFE",
      "number": "333",
      "complement": "ANDAR 3 SALA 31 C",
      "neighborhood": "CENTRO",
      "city": "ATIBAIA",
      "city_ibge_code": "3504107",
      "uf": "SP",
      "zipcode": "12940440"
    },
    "main_cnae": {
      "code": "7112000",
      "description": "SERVIÇOS DE ENGENHARIA"
    },
    "secondary_cnaes": [
      {
        "code": "4110700",
        "description": "INCORPORAÇÃO DE EMPREENDIMENTOS IMOBILIÁRIOS"
      },
      {
        "code": "4120400",
        "description": "CONSTRUÇÃO DE EDIFÍCIOS"
      },
      {
        "code": "4213800",
        "description": "OBRAS DE URBANIZAÇÃO - RUAS, PRAÇAS E CALÇADAS"
      },
      {
        "code": "4319300",
        "description": "SERVIÇOS DE PREPARAÇÃO DO TERRENO NÃO ESPECIFICADOS ANTERIORMENTE"
      },
      {
        "code": "4322301",
        "description": "INSTALAÇÕES HIDRÁULICAS, SANITÁRIAS E DE GÁS"
      },
      {
        "code": "4329104",
        "description": "MONTAGEM E INSTALAÇÃO DE SISTEMAS E EQUIPAMENTOS DE ILUMINAÇÃO E SINALIZAÇÃO EM VIAS PÚBLICAS, PORTOS E AEROPORTOS"
      },
      {
        "code": "4330404",
        "description": "SERVIÇOS DE PINTURA DE EDIFÍCIOS EM GERAL"
      },
      {
        "code": "4669999",
        "description": "COMÉRCIO ATACADISTA DE OUTRAS MÁQUINAS E EQUIPAMENTOS NÃO ESPECIFICADOS ANTERIORMENTE; PARTES E PEÇAS"
      },
      {
        "code": "4744099",
        "description": "COMÉRCIO VAREJISTA DE MATERIAIS DE CONSTRUÇÃO EM GERAL"
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
        "code": "4789099",
        "description": "COMÉRCIO VAREJISTA DE OUTROS PRODUTOS NÃO ESPECIFICADOS ANTERIORMENTE"
      },
      {
        "code": "6810201",
        "description": "COMPRA E VENDA DE IMÓVEIS PRÓPRIOS"
      },
      {
        "code": "6810202",
        "description": "ALUGUEL DE IMÓVEIS PRÓPRIOS"
      },
      {
        "code": "7020400",
        "description": "ATIVIDADES DE CONSULTORIA EM GESTÃO EMPRESARIAL, EXCETO CONSULTORIA TÉCNICA ESPECÍFICA"
      },
      {
        "code": "7119701",
        "description": "SERVIÇOS DE CARTOGRAFIA, TOPOGRAFIA E GEODÉSIA"
      },
      {
        "code": "7119703",
        "description": "SERVIÇOS DE DESENHO TÉCNICO RELACIONADOS À ARQUITETURA E ENGENHARIA"
      },
      {
        "code": "7119704",
        "description": "SERVIÇOS DE PERÍCIA TÉCNICA RELACIONADOS À SEGURANÇA DO TRABALHO"
      },
      {
        "code": "7119799",
        "description": "ATIVIDADES TÉCNICAS RELACIONADAS À ENGENHARIA E ARQUITETURA NÃO ESPECIFICADAS ANTERIORMENTE"
      },
      {
        "code": "8211300",
        "description": "SERVIÇOS COMBINADOS DE ESCRITÓRIO E APOIO ADMINISTRATIVO"
      }
    ],
    "refreshed_at": "2026-10-30T13:32:46.254Z",
    "evidences": [
      {
        "category": "INFRACAO_AMBIENTAL",
        "evidences": [
          {
            "id": "6ae49c7e0f3f8176322f965d",
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
            "id": "6ae49c7e0f3f8176322f9666",
            "source_slug": "CGU_CEIS",
            "source": "CGU — Cadastro de Empresas Inidôneas e Suspensas (CEIS)",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Sanção administrativa registrada no CEIS",
            "source_reference": "375021",
            "source_url": "https://api.portaldatransparencia.gov.br/api-de-dados/ceis/375021",
            "details": {
              "id": "375021",
              "cnpj": "50375702000128",
              "authority": "Prefeitura Municipal de São Bento do Sul (SC)",
              "sanctionType": "Impedimento/proibição de contratar com prazo determinado",
              "startDate": "2025-12-09",
              "endDate": "2027-12-09",
              "publicationDate": "2026-01-15"
            },
            "published_at": "2026-01-15T00:00:00.000Z",
            "collected_at": "2026-10-30T13:32:46.394Z",
            "valid_until": "2026-10-31T13:32:46.394Z"
          },
          {
            "id": "6ae49c7e0f3f8176322f9661",
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
            "collected_at": "2026-10-30T13:32:46.394Z",
            "valid_until": "2026-10-31T13:32:46.394Z"
          }
        ]
      },
      {
        "category": "EMISSAO_GEE",
        "evidences": [
          {
            "id": "6ae49c7e0f3f8176322f965b",
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
            "collected_at": "2026-10-30T13:32:46.374Z",
            "valid_until": "2026-10-30T13:47:46.374Z"
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
        "calculated_at": "2026-10-30T13:37:58.497Z",
        "contributions": []
      },
      {
        "ods_number": 15,
        "calculation_status": "CALCULATED",
        "index_status": "AVAILABLE",
        "score_value": -5,
        "confidence_value": 0.2777777777777778,
        "evidence_count": 1,
        "coverage_status": "HAS_RECORDS",
        "sources_without_records": [
          "IBAMA",
          "CGU_CNEP"
        ],
        "rules_version": "rf10-rf11-v3",
        "calculated_at": "2026-10-30T13:37:58.497Z",
        "contributions": [
          {
            "evidence": {
              "id": "6ae49c7e0f3f8176322f9666",
              "category": "CONDUTA_ADMINISTRATIVA",
              "source_slug": "CGU_CEIS",
              "source": "CGU — Cadastro de Empresas Inidôneas e Suspensas (CEIS)",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "375021",
              "source_url": "https://api.portaldatransparencia.gov.br/api-de-dados/ceis/375021",
              "collected_at": "2026-10-30T13:32:46.394Z",
              "valid_until": "2026-10-31T13:32:46.394Z"
            },
            "weight": 5,
            "weight_reason": null,
            "signal": "NEGATIVE",
            "points": -5
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
