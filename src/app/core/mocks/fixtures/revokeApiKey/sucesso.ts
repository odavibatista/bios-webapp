// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { RevokeApiKeyResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "revokeApiKey",
  "scenario": "sucesso",
  "description": "Chave revogada",
  "request": {
    "method": "DELETE",
    "path": "/api-keys/6ae498320f3f8176322d08d8"
  },
  "status": 204,
  "headers": {},
  "body": null
} satisfies CapturedResponse<RevokeApiKeyResponses, 204>;
