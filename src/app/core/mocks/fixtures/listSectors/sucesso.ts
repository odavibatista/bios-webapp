// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { ListSectorsResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "listSectors",
  "scenario": "sucesso",
  "description": "Divisões CNAE com a descrição oficial",
  "request": {
    "method": "GET",
    "path": "/sectors"
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "data": [
      {
        "cnae_division": "24",
        "description": "METALURGIA"
      },
      {
        "cnae_division": "47",
        "description": "COMÉRCIO VAREJISTA"
      },
      {
        "cnae_division": "71",
        "description": "SERVIÇOS DE ARQUITETURA E ENGENHARIA; TESTES E ANÁLISES TÉCNICAS"
      },
      {
        "cnae_division": "85",
        "description": "EDUCAÇÃO"
      }
    ]
  }
} satisfies CapturedResponse<ListSectorsResponses, 200>;
