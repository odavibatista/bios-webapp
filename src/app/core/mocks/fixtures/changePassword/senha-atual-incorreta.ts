// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { ChangePasswordErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "changePassword",
  "scenario": "senha-atual-incorreta",
  "description": "Senha atual errada",
  "request": {
    "method": "POST",
    "path": "/auth/change-password",
    "body": {
      "current_password": "<senha>",
      "new_password": "<senha>"
    }
  },
  "status": 422,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "statusCode": 422,
    "code": "INVALID_CURRENT_PASSWORD",
    "message": "A senha atual está incorreta.",
    "timestamp": "2026-10-30T13:14:33.244Z",
    "path": "/auth/change-password"
  }
} satisfies CapturedResponse<ChangePasswordErrors, 422>;
