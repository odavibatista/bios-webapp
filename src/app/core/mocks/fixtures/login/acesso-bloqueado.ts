// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { LoginErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "login",
  "scenario": "acesso-bloqueado",
  "description": "Bloqueio temporário: nem a senha certa entra (RF20)",
  "request": {
    "method": "POST",
    "path": "/auth/login",
    "body": {
      "email": "bloqueio@example.com",
      "password": "<senha>"
    }
  },
  "status": 429,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "statusCode": 429,
    "code": "ACCESS_TEMPORARILY_BLOCKED",
    "message": "Acesso temporariamente bloqueado. Tente novamente mais tarde.",
    "details": {
      "retry_after_seconds": 900
    },
    "timestamp": "2026-10-30T13:38:58.617Z",
    "path": "/auth/login"
  }
} satisfies CapturedResponse<LoginErrors, 429>;
