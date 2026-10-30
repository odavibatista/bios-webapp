// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetOwnAccountErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getOwnAccount",
  "scenario": "sem-sessao",
  "description": "Sem token de acesso",
  "request": {
    "method": "GET",
    "path": "/accounts/me"
  },
  "status": 401,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "statusCode": 401,
    "code": "NOT_AUTHENTICATED",
    "message": "Autenticação necessária. Entre para continuar.",
    "timestamp": "2026-10-30T13:14:26.106Z",
    "path": "/accounts/me"
  }
} satisfies CapturedResponse<GetOwnAccountErrors, 401>;
