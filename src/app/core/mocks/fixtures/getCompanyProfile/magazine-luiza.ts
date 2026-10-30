// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetCompanyProfileResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getCompanyProfile",
  "scenario": "magazine-luiza",
  "description": "Perfil completo: Sem registro em nenhuma fonte ambiental (NOT_FOUND); GHG não verificado",
  "request": {
    "method": "GET",
    "path": "/companies/47960950000121"
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "cnpj": "47960950000121",
    "legal_name": "MAGAZINE LUIZA S/A",
    "trade_name": "MAGAZINE LUIZA",
    "registration_status": "ATIVA",
    "registration_status_unrecognized": null,
    "company_size": "DEMAIS",
    "address": {
      "street": "RUA VOLUNTARIOS DA FRANCA",
      "number": "1465",
      "complement": null,
      "neighborhood": "CENTRO",
      "city": "FRANCA",
      "city_ibge_code": "3516200",
      "uf": "SP",
      "zipcode": "14400490"
    },
    "main_cnae": {
      "code": "4713004",
      "description": "LOJAS DE DEPARTAMENTOS OU MAGAZINES, EXCETO LOJAS FRANCAS (DUTY FREE)"
    },
    "secondary_cnaes": [
      {
        "code": "3329501",
        "description": "SERVIÇOS DE MONTAGEM DE MÓVEIS DE QUALQUER MATERIAL"
      },
      {
        "code": "4623109",
        "description": "COMÉRCIO ATACADISTA DE ALIMENTOS PARA ANIMAIS"
      },
      {
        "code": "4635401",
        "description": "COMÉRCIO ATACADISTA DE ÁGUA MINERAL"
      },
      {
        "code": "4635402",
        "description": "COMÉRCIO ATACADISTA DE CERVEJA, CHOPE E REFRIGERANTE"
      },
      {
        "code": "4635499",
        "description": "COMÉRCIO ATACADISTA DE BEBIDAS NÃO ESPECIFICADAS ANTERIORMENTE"
      },
      {
        "code": "4646001",
        "description": "COMÉRCIO ATACADISTA DE COSMÉTICOS E PRODUTOS DE PERFUMARIA"
      },
      {
        "code": "4646002",
        "description": "COMÉRCIO ATACADISTA DE PRODUTOS DE HIGIENE PESSOAL"
      },
      {
        "code": "4649408",
        "description": "COMÉRCIO ATACADISTA DE PRODUTOS DE HIGIENE, LIMPEZA E CONSERVAÇÃO DOMICILIAR"
      },
      {
        "code": "4691500",
        "description": "COMÉRCIO ATACADISTA DE MERCADORIAS EM GERAL, COM PREDOMINÂNCIA DE PRODUTOS ALIMENTÍCIOS"
      },
      {
        "code": "4693100",
        "description": "COMÉRCIO ATACADISTA DE MERCADORIAS EM GERAL, SEM PREDOMINÂNCIA DE ALIMENTOS OU DE INSUMOS AGROPECUÁRIOS"
      },
      {
        "code": "4711302",
        "description": "COMÉRCIO VAREJISTA DE MERCADORIAS EM GERAL, COM PREDOMINÂNCIA DE PRODUTOS ALIMENTÍCIOS - SUPERMERCADOS"
      },
      {
        "code": "4723700",
        "description": "COMÉRCIO VAREJISTA DE BEBIDAS"
      },
      {
        "code": "4729699",
        "description": "COMÉRCIO VAREJISTA DE PRODUTOS ALIMENTÍCIOS EM GERAL OU ESPECIALIZADO EM PRODUTOS ALIMENTÍCIOS NÃO ESPECIFICADOS ANTERIORMENTE"
      },
      {
        "code": "4753900",
        "description": "COMÉRCIO VAREJISTA ESPECIALIZADO DE ELETRODOMÉSTICOS E EQUIPAMENTOS DE ÁUDIO E VÍDEO"
      },
      {
        "code": "4771701",
        "description": "COMÉRCIO VAREJISTA DE PRODUTOS FARMACÊUTICOS, SEM MANIPULAÇÃO DE FÓRMULAS"
      },
      {
        "code": "4771704",
        "description": "COMÉRCIO VAREJISTA DE MEDICAMENTOS VETERINÁRIOS"
      },
      {
        "code": "4772500",
        "description": "COMÉRCIO VAREJISTA DE COSMÉTICOS, PRODUTOS DE PERFUMARIA E DE HIGIENE PESSOAL"
      },
      {
        "code": "4774100",
        "description": "COMÉRCIO VAREJISTA DE ARTIGOS DE ÓPTICA"
      },
      {
        "code": "4789099",
        "description": "COMÉRCIO VAREJISTA DE OUTROS PRODUTOS NÃO ESPECIFICADOS ANTERIORMENTE"
      },
      {
        "code": "5211799",
        "description": "DEPÓSITOS DE MERCADORIAS PARA TERCEIROS, EXCETO ARMAZÉNS GERAIS E GUARDA MÓVEIS"
      },
      {
        "code": "6202300",
        "description": "DESENVOLVIMENTO E LICENCIAMENTO DE PROGRAMAS DE COMPUTADOR CUSTOMIZÁVEIS"
      },
      {
        "code": "6203100",
        "description": "DESENVOLVIMENTO E LICENCIAMENTO DE PROGRAMAS DE COMPUTADOR NÃO CUSTOMIZÁVEIS"
      },
      {
        "code": "6311900",
        "description": "TRATAMENTO DE DADOS, PROVEDORES DE SERVIÇOS DE APLICAÇÃO E SERVIÇOS DE HOSPEDAGEM NA INTERNET"
      },
      {
        "code": "6319400",
        "description": "PORTAIS, PROVEDORES DE CONTEÚDO E OUTROS SERVIÇOS DE INFORMAÇÃO NA INTERNET"
      },
      {
        "code": "6619302",
        "description": "CORRESPONDENTES DE INSTITUIÇÕES FINANCEIRAS"
      },
      {
        "code": "7311400",
        "description": "AGÊNCIAS DE PUBLICIDADE"
      },
      {
        "code": "7312200",
        "description": "AGENCIAMENTO DE ESPAÇOS PARA PUBLICIDADE, EXCETO EM VEÍCULOS DE COMUNICAÇÃO"
      },
      {
        "code": "7319002",
        "description": "PROMOÇÃO DE VENDAS"
      },
      {
        "code": "7319004",
        "description": "CONSULTORIA EM PUBLICIDADE"
      },
      {
        "code": "7319099",
        "description": "OUTRAS ATIVIDADES DE PUBLICIDADE NÃO ESPECIFICADAS ANTERIORMENTE"
      },
      {
        "code": "7490104",
        "description": "ATIVIDADES DE INTERMEDIAÇÃO E AGENCIAMENTO DE SERVIÇOS E NEGÓCIOS EM GERAL, EXCETO IMOBILIÁRIOS"
      },
      {
        "code": "7729202",
        "description": "ALUGUEL DE MÓVEIS, UTENSÍLIOS E APARELHOS DE USO DOMÉSTICO E PESSOAL; INSTRUMENTOS MUSICAIS"
      },
      {
        "code": "7911200",
        "description": "AGÊNCIAS DE VIAGENS"
      },
      {
        "code": "7912100",
        "description": "OPERADORES TURÍSTICOS"
      },
      {
        "code": "7990200",
        "description": "SERVIÇOS DE RESERVAS E OUTROS SERVIÇOS DE TURISMO NÃO ESPECIFICADOS ANTERIORMENTE"
      }
    ],
    "refreshed_at": "2026-10-30T13:32:52.446Z",
    "evidences": [
      {
        "category": "INFRACAO_AMBIENTAL",
        "evidences": [
          {
            "id": "6ae49c840f3f8176322f96d3",
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
            "id": "6ae49c840f3f8176322f96da",
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
            "collected_at": "2026-10-30T13:32:52.601Z",
            "valid_until": "2026-10-31T13:32:52.601Z"
          },
          {
            "id": "6ae49c840f3f8176322f96d7",
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
            "collected_at": "2026-10-30T13:32:52.601Z",
            "valid_until": "2026-10-31T13:32:52.601Z"
          }
        ]
      },
      {
        "category": "EMISSAO_GEE",
        "evidences": [
          {
            "id": "6ae49c840f3f8176322f96d0",
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
            "collected_at": "2026-10-30T13:32:52.583Z",
            "valid_until": "2026-10-30T13:47:52.583Z"
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
        "calculated_at": "2026-10-30T13:37:59.349Z",
        "contributions": []
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
        "calculated_at": "2026-10-30T13:37:59.349Z",
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
          "origin": "UNAVAILABLE",
          "evidence_state": "UNKNOWN"
        }
      ],
      "scores_pending": false,
      "retry_after_seconds": 900
    }
  }
} satisfies CapturedResponse<GetCompanyProfileResponses, 200>;
