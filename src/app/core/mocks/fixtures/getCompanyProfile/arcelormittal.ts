// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetCompanyProfileResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getCompanyProfile",
  "scenario": "arcelormittal",
  "description": "Perfil completo: Divisão CNAE 24; inventário de emissões confirmado no GHG Protocol",
  "request": {
    "method": "GET",
    "path": "/companies/17469701000177"
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "cnpj": "17469701000177",
    "legal_name": "ARCELORMITTAL BRASIL S.A.",
    "trade_name": null,
    "registration_status": "ATIVA",
    "registration_status_unrecognized": null,
    "company_size": "DEMAIS",
    "address": {
      "street": "AVENIDA CARANDAI",
      "number": "1115",
      "complement": "ANDAR 24",
      "neighborhood": "FUNCIONARIOS",
      "city": "BELO HORIZONTE",
      "city_ibge_code": "3106200",
      "uf": "MG",
      "zipcode": "30130915"
    },
    "main_cnae": {
      "code": "2423702",
      "description": "PRODUÇÃO DE LAMINADOS LONGOS DE AÇO, EXCETO TUBOS"
    },
    "secondary_cnaes": [
      {
        "code": "0210101",
        "description": "CULTIVO DE EUCALIPTO"
      },
      {
        "code": "0210106",
        "description": "CULTIVO DE MUDAS EM VIVEIROS FLORESTAIS"
      },
      {
        "code": "0210107",
        "description": "EXTRAÇÃO DE MADEIRA EM FLORESTAS PLANTADAS"
      },
      {
        "code": "0210108",
        "description": "PRODUÇÃO DE CARVÃO VEGETAL - FLORESTAS PLANTADAS"
      },
      {
        "code": "0230600",
        "description": "ATIVIDADES DE APOIO À PRODUÇÃO FLORESTAL"
      },
      {
        "code": "0710301",
        "description": "EXTRAÇÃO DE MINÉRIO DE FERRO"
      },
      {
        "code": "0710302",
        "description": "PELOTIZAÇÃO, SINTERIZAÇÃO E OUTROS BENEFICIAMENTOS DE MINÉRIO DE FERRO"
      },
      {
        "code": "0990401",
        "description": "ATIVIDADES DE APOIO À EXTRAÇÃO DE MINÉRIO DE FERRO"
      },
      {
        "code": "1610203",
        "description": "SERRARIAS COM DESDOBRAMENTO DE MADEIRA EM BRUTO"
      },
      {
        "code": "2422901",
        "description": "PRODUÇÃO DE LAMINADOS PLANOS DE AÇO AO CARBONO, REVESTIDOS OU NÃO"
      },
      {
        "code": "2422902",
        "description": "PRODUÇÃO DE LAMINADOS PLANOS DE AÇOS ESPECIAIS"
      },
      {
        "code": "2424501",
        "description": "PRODUÇÃO DE ARAMES DE AÇO"
      },
      {
        "code": "2424502",
        "description": "PRODUÇÃO DE RELAMINADOS, TREFILADOS E PERFILADOS DE AÇO, EXCETO ARAMES"
      },
      {
        "code": "2431800",
        "description": "PRODUÇÃO DE TUBOS DE AÇO COM COSTURA"
      },
      {
        "code": "2452100",
        "description": "FUNDIÇÃO DE METAIS NÃO FERROSOS E SUAS LIGAS"
      },
      {
        "code": "2511000",
        "description": "FABRICAÇÃO DE ESTRUTURAS METÁLICAS"
      },
      {
        "code": "2592602",
        "description": "FABRICAÇÃO DE PRODUTOS DE TREFILADOS DE METAL, EXCETO PADRONIZADOS"
      },
      {
        "code": "2599302",
        "description": "SERVIÇO DE CORTE E DOBRA DE METAIS"
      },
      {
        "code": "2599399",
        "description": "FABRICAÇÃO DE OUTROS PRODUTOS DE METAL NÃO ESPECIFICADOS ANTERIORMENTE"
      },
      {
        "code": "2829199",
        "description": "FABRICAÇÃO DE OUTRAS MÁQUINAS E EQUIPAMENTOS DE USO GERAL NÃO ESPECIFICADOS ANTERIORMENTE, PEÇAS E ACESSÓRIOS"
      },
      {
        "code": "3314710",
        "description": "MANUTENÇÃO E REPARAÇÃO DE MÁQUINAS E EQUIPAMENTOS PARA USO GERAL NÃO ESPECIFICADOS ANTERIORMENTE"
      },
      {
        "code": "3511501",
        "description": "GERAÇÃO DE ENERGIA ELÉTRICA"
      },
      {
        "code": "3513100",
        "description": "COMÉRCIO ATACADISTA DE ENERGIA ELÉTRICA"
      },
      {
        "code": "3520402",
        "description": "DISTRIBUIÇÃO DE COMBUSTÍVEIS GASOSOS POR REDES URBANAS"
      },
      {
        "code": "3831999",
        "description": "RECUPERAÇÃO DE MATERIAIS METÁLICOS, EXCETO ALUMÍNIO"
      },
      {
        "code": "4613300",
        "description": "REPRESENTANTES COMERCIAIS E AGENTES DO COMÉRCIO DE MADEIRA, MATERIAL DE CONSTRUÇÃO E FERRAGENS"
      },
      {
        "code": "4619200",
        "description": "REPRESENTANTES COMERCIAIS E AGENTES DO COMÉRCIO DE MERCADORIAS EM GERAL NÃO ESPECIALIZADO"
      },
      {
        "code": "4672900",
        "description": "COMÉRCIO ATACADISTA DE FERRAGENS E FERRAMENTAS"
      },
      {
        "code": "4679604",
        "description": "COMÉRCIO ATACADISTA ESPECIALIZADO DE MATERIAIS DE CONSTRUÇÃO NÃO ESPECIFICADOS ANTERIORMENTE"
      },
      {
        "code": "4679699",
        "description": "COMÉRCIO ATACADISTA DE MATERIAIS DE CONSTRUÇÃO EM GERAL"
      },
      {
        "code": "4685100",
        "description": "COMÉRCIO ATACADISTA DE PRODUTOS SIDERÚRGICOS E METALÚRGICOS, EXCETO PARA CONSTRUÇÃO"
      },
      {
        "code": "4687703",
        "description": "COMÉRCIO ATACADISTA DE RESÍDUOS E SUCATAS METÁLICOS"
      },
      {
        "code": "4689301",
        "description": "COMÉRCIO ATACADISTA DE PRODUTOS DA EXTRAÇÃO MINERAL, EXCETO COMBUSTÍVEIS"
      },
      {
        "code": "4744005",
        "description": "COMÉRCIO VAREJISTA DE MATERIAIS DE CONSTRUÇÃO NÃO ESPECIFICADOS ANTERIORMENTE"
      },
      {
        "code": "4744099",
        "description": "COMÉRCIO VAREJISTA DE MATERIAIS DE CONSTRUÇÃO EM GERAL"
      },
      {
        "code": "4789099",
        "description": "COMÉRCIO VAREJISTA DE OUTROS PRODUTOS NÃO ESPECIFICADOS ANTERIORMENTE"
      },
      {
        "code": "5030101",
        "description": "NAVEGAÇÃO DE APOIO MARÍTIMO"
      },
      {
        "code": "5211701",
        "description": "ARMAZÉNS GERAIS - EMISSÃO DE WARRANT"
      },
      {
        "code": "5231102",
        "description": "ATIVIDADES DO OPERADOR PORTUÁRIO"
      },
      {
        "code": "6399200",
        "description": "OUTRAS ATIVIDADES DE PRESTAÇÃO DE SERVIÇOS DE INFORMAÇÃO NÃO ESPECIFICADAS ANTERIORMENTE"
      },
      {
        "code": "6462000",
        "description": "HOLDINGS DE INSTITUIÇÕES NÃO FINANCEIRAS"
      },
      {
        "code": "6463800",
        "description": "OUTRAS SOCIEDADES DE PARTICIPAÇÃO, EXCETO HOLDINGS"
      },
      {
        "code": "7020400",
        "description": "ATIVIDADES DE CONSULTORIA EM GESTÃO EMPRESARIAL, EXCETO CONSULTORIA TÉCNICA ESPECÍFICA"
      },
      {
        "code": "7112000",
        "description": "SERVIÇOS DE ENGENHARIA"
      },
      {
        "code": "7210000",
        "description": "PESQUISA E DESENVOLVIMENTO EXPERIMENTAL EM CIÊNCIAS FÍSICAS E NATURAIS"
      },
      {
        "code": "7732201",
        "description": "ALUGUEL DE MÁQUINAS E EQUIPAMENTOS PARA CONSTRUÇÃO SEM OPERADOR, EXCETO ANDAIMES"
      },
      {
        "code": "7740300",
        "description": "GESTÃO DE ATIVOS INTANGÍVEIS NÃO FINANCEIROS"
      },
      {
        "code": "8211300",
        "description": "SERVIÇOS COMBINADOS DE ESCRITÓRIO E APOIO ADMINISTRATIVO"
      },
      {
        "code": "8219999",
        "description": "PREPARAÇÃO DE DOCUMENTOS E SERVIÇOS ESPECIALIZADOS DE APOIO ADMINISTRATIVO NÃO ESPECIFICADOS ANTERIORMENTE"
      }
    ],
    "refreshed_at": "2026-10-30T13:32:32.130Z",
    "evidences": [
      {
        "category": "INFRACAO_AMBIENTAL",
        "evidences": [
          {
            "id": "6ae495a8703dbcb48300dc70",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Multa simples: Infração do CTF(Não Classificada-Móvel) — R$ 7.000,00 (BELO HORIZONTE/MG)",
            "source_reference": "9099193-E",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
            "details": {
              "resource": "AUTO_INFRACAO",
              "notice_type": "Multa simples",
              "infraction_type": "Cadastro Técnico Federal",
              "infraction_code": "910000",
              "infraction_description": "Infração do CTF(Não Classificada-Móvel)",
              "fine_amount": 7000,
              "biomes": "Mata Atlantica",
              "municipality": "BELO HORIZONTE",
              "municipality_code": "3106200",
              "uf": "MG",
              "process_number": "02009.000268/2016-62",
              "status": "Lavrado"
            },
            "published_at": "2016-03-23T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          },
          {
            "id": "6ae495c3703dbcb48301189b",
            "source_slug": "IBAMA",
            "source": "IBAMA — Dados Abertos",
            "ods_number": 15,
            "state": "CONFIRMED",
            "signal": "NEGATIVE",
            "summary": "Multa simples: Infração da Flora(Não Classificada-Móvel) — R$ 3.198,00 (SAO PAULO/SP)",
            "source_reference": "9121172-E",
            "source_url": "https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao",
            "details": {
              "resource": "AUTO_INFRACAO",
              "notice_type": "Multa simples",
              "infraction_type": "Flora",
              "infraction_code": "409999",
              "infraction_description": "Infração da Flora(Não Classificada-Móvel)",
              "fine_amount": 3198,
              "biomes": "Mata Atlantica",
              "municipality": "SAO PAULO",
              "municipality_code": "3550308",
              "uf": "SP",
              "process_number": "02027.106699/2017-02",
              "status": "Lavrado"
            },
            "published_at": "2017-10-11T00:00:00.000Z",
            "collected_at": "2026-10-30T12:49:25.354Z",
            "valid_until": "2026-11-01T12:49:25.354Z"
          }
        ]
      },
      {
        "category": "CONDUTA_ADMINISTRATIVA",
        "evidences": [
          {
            "id": "6ae49c700f3f8176322f961e",
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
            "collected_at": "2026-10-30T13:32:32.358Z",
            "valid_until": "2026-10-31T13:32:32.358Z"
          },
          {
            "id": "6ae49c700f3f8176322f961b",
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
            "collected_at": "2026-10-30T13:32:32.359Z",
            "valid_until": "2026-10-31T13:32:32.359Z"
          }
        ]
      },
      {
        "category": "EMISSAO_GEE",
        "evidences": [
          {
            "id": "6ae49c750f3f8176322f9623",
            "source_slug": "GHG_PROTOCOL",
            "source": "GHG Protocol — Registro Público de Emissões",
            "ods_number": 13,
            "state": "CONFIRMED",
            "signal": "POSITIVE",
            "summary": "Inventário de emissões de GEE publicado: ano 2025.",
            "source_reference": "2613/19",
            "source_url": "https://sistema-registropublicodeemissoesapi.fgv.br/GenerateReport/GenerateInventoryReport/2613/19/true",
            "details": {
              "organizationId": 2613,
              "cycleId": 19,
              "inventoryYear": 2025
            },
            "published_at": null,
            "collected_at": "2026-10-30T13:32:32.338Z",
            "valid_until": "2026-11-29T13:32:32.338Z"
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
        "calculated_at": "2026-10-30T13:37:57.375Z",
        "contributions": [
          {
            "evidence": {
              "id": "6ae49c750f3f8176322f9623",
              "category": "EMISSAO_GEE",
              "source_slug": "GHG_PROTOCOL",
              "source": "GHG Protocol — Registro Público de Emissões",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "2613/19",
              "source_url": "https://sistema-registropublicodeemissoesapi.fgv.br/GenerateReport/GenerateInventoryReport/2613/19/true",
              "collected_at": "2026-10-30T13:32:32.338Z",
              "valid_until": "2026-11-29T13:32:32.338Z"
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
        "confidence_value": 0.5,
        "evidence_count": 2,
        "coverage_status": "HAS_RECORDS",
        "sources_without_records": [
          "CGU_CEIS",
          "CGU_CNEP"
        ],
        "rules_version": "rf10-rf11-v3",
        "calculated_at": "2026-10-30T13:37:57.375Z",
        "contributions": [
          {
            "evidence": {
              "id": "6ae495a8703dbcb48300dc70",
              "category": "INFRACAO_AMBIENTAL",
              "source_slug": "IBAMA",
              "source": "IBAMA — Dados Abertos",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "9099193-E",
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
              "id": "6ae495c3703dbcb48301189b",
              "category": "INFRACAO_AMBIENTAL",
              "source_slug": "IBAMA",
              "source": "IBAMA — Dados Abertos",
              "state": "CONFIRMED",
              "current_state": "CONFIRMED",
              "source_reference": "9121172-E",
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
