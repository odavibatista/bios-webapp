// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { ListOdsResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "listOds",
  "scenario": "sucesso",
  "description": "ODS calculados pelo BIOS",
  "request": {
    "method": "GET",
    "path": "/ods"
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "data": [
      {
        "ods_number": 13,
        "title": "Ação Contra a Mudança Global do Clima",
        "description": "Tomar medidas urgentes para combater a mudança do clima e seus impactos."
      },
      {
        "ods_number": 15,
        "title": "Vida Terrestre",
        "description": "Proteger, recuperar e promover o uso sustentável dos ecossistemas terrestres, gerir de forma sustentável as florestas, combater a desertificação, deter e reverter a degradação da terra e deter a perda de biodiversidade."
      }
    ]
  }
} satisfies CapturedResponse<ListOdsResponses, 200>;
