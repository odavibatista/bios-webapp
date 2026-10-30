// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { LoginResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "login",
  "scenario": "sucesso",
  "description": "Sessão aberta",
  "request": {
    "method": "POST",
    "path": "/auth/login",
    "body": {
      "email": "apresentacao@example.com",
      "password": "<senha>"
    }
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "access_token": "token-de-acesso-de-demonstracao-1",
    "refresh_token": "token-de-renovacao-de-demonstracao-1",
    "token_type": "Bearer",
    "expires_in": 900,
    "user": {
      "id": "6ae498260f3f8176322d018e",
      "name": "Conta de Demonstração",
      "role": "USER"
    }
  }
} satisfies CapturedResponse<LoginResponses, 200>;
