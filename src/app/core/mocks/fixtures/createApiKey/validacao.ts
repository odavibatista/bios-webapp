// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { CreateApiKeyErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "createApiKey",
  "scenario": "validacao",
  "description": "Nome vazio",
  "request": {
    "method": "POST",
    "path": "/api-keys",
    "body": {
      "name": ""
    }
  },
  "status": 422,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "statusCode": 422,
    "code": "VALIDATION_FAILED",
    "message": "Os dados enviados são inválidos.",
    "details": [
      {
        "path": "name",
        "message": "O nome deve ter ao menos 2 caracteres."
      }
    ],
    "timestamp": "2026-10-30T13:14:26.283Z",
    "path": "/api-keys"
  }
} satisfies CapturedResponse<CreateApiKeyErrors, 422>;
