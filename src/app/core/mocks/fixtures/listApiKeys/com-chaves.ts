// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { ListApiKeysResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "listApiKeys",
  "scenario": "com-chaves",
  "description": "Duas chaves ativas",
  "request": {
    "method": "GET",
    "path": "/api-keys"
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "data": [
      {
        "id": "6ae498320f3f8176322d08d8",
        "name": "Painel de BI",
        "prefix": "bios_hSOZyGeb",
        "created_at": "2026-10-30T13:14:26.265Z",
        "last_used_at": null
      },
      {
        "id": "6ae498320f3f8176322d08d4",
        "name": "Planilha de fornecedores",
        "prefix": "bios_ZvdVkOaC",
        "created_at": "2026-10-30T13:14:26.239Z",
        "last_used_at": null
      }
    ]
  }
} satisfies CapturedResponse<ListApiKeysResponses, 200>;
