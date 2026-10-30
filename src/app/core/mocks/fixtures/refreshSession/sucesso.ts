// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { RefreshSessionResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "refreshSession",
  "scenario": "sucesso",
  "description": "Renovação: novo par de tokens",
  "request": {
    "method": "POST",
    "path": "/auth/refresh",
    "body": {
      "refresh_token": "token-de-renovacao-de-demonstracao-1"
    }
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "access_token": "token-de-acesso-de-demonstracao-2",
    "refresh_token": "token-de-renovacao-de-demonstracao-2",
    "token_type": "Bearer",
    "expires_in": 900,
    "user": {
      "id": "6ae498260f3f8176322d018e",
      "name": "Conta de Demonstração",
      "role": "USER"
    }
  }
} satisfies CapturedResponse<RefreshSessionResponses, 200>;
