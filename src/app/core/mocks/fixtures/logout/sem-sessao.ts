// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { LogoutErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "logout",
  "scenario": "sem-sessao",
  "description": "Token de sessão já encerrada",
  "request": {
    "method": "POST",
    "path": "/auth/logout"
  },
  "status": 401,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "statusCode": 401,
    "code": "NOT_AUTHENTICATED",
    "message": "Autenticação necessária. Entre para continuar.",
    "timestamp": "2026-10-30T13:14:36.372Z",
    "path": "/auth/logout"
  }
} satisfies CapturedResponse<LogoutErrors, 401>;
