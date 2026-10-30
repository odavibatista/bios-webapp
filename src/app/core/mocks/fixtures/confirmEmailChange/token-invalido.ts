// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { ConfirmEmailChangeErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "confirmEmailChange",
  "scenario": "token-invalido",
  "description": "Link já usado",
  "request": {
    "method": "POST",
    "path": "/accounts/confirm-email-change",
    "body": {
      "token": "token-do-link-de-demonstracao"
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
    "timestamp": "2026-10-30T13:14:28.880Z",
    "path": "/accounts/confirm-email-change"
  }
} satisfies CapturedResponse<ConfirmEmailChangeErrors, 400>;
