// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetSectorEvolutionResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getSectorEvolution",
  "scenario": "setor-sem-empresas",
  "description": "Divisão válida sem empresa na base",
  "request": {
    "method": "GET",
    "path": "/sectors/01/evolution",
    "query": {
      "ods": "13"
    }
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "cnae_division": "01",
    "cnae_division_description": "AGRICULTURA, PECUÁRIA E SERVIÇOS RELACIONADOS",
    "ods_number": 13,
    "history_status": "INSUFFICIENT",
    "windows": []
  }
} satisfies CapturedResponse<GetSectorEvolutionResponses, 200>;
