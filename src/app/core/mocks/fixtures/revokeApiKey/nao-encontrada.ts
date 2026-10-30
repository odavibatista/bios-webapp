// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { RevokeApiKeyErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "revokeApiKey",
  "scenario": "nao-encontrada",
  "description": "Chave inexistente (ou de outra conta)",
  "request": {
    "method": "DELETE",
    "path": "/api-keys/ffffffffffffffffffffffff"
  },
  "status": 404,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "statusCode": 404,
    "code": "API_KEY_NOT_FOUND",
    "message": "Chave de API não encontrada.",
    "timestamp": "2026-10-30T13:14:26.326Z",
    "path": "/api-keys/ffffffffffffffffffffffff"
  }
} satisfies CapturedResponse<RevokeApiKeyErrors, 404>;
