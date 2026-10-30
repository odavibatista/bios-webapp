// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { ResetPasswordErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "resetPassword",
  "scenario": "token-invalido",
  "description": "Link já usado",
  "request": {
    "method": "POST",
    "path": "/auth/reset-password",
    "body": {
      "token": "token-do-link-de-demonstracao",
      "new_password": "<senha>"
    }
  },
  "status": 400,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "statusCode": 400,
    "code": "USER_TOKEN_INVALID",
    "message": "O link é inválido, expirou ou já foi usado. Solicite um novo.",
    "timestamp": "2026-10-30T13:14:36.048Z",
    "path": "/auth/reset-password"
  }
} satisfies CapturedResponse<ResetPasswordErrors, 400>;
