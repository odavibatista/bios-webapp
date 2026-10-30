// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { RefreshSessionErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "refreshSession",
  "scenario": "token-invalido",
  "description": "Refresh token inexistente",
  "request": {
    "method": "POST",
    "path": "/auth/refresh",
    "body": {
      "refresh_token": "GTcKcm2bU_qa5g97J7WkZP6_R-N-KW8myffZV6kb944"
    }
  },
  "status": 401,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "statusCode": 401,
    "code": "SESSION_INVALID",
    "message": "Sessão inválida ou expirada. Entre novamente.",
    "timestamp": "2026-10-30T13:14:26.088Z",
    "path": "/auth/refresh"
  }
} satisfies CapturedResponse<RefreshSessionErrors, 401>;
