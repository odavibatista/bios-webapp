// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { ConfirmEmailErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "confirmEmail",
  "scenario": "token-invalido",
  "description": "Link já usado (ou expirado)",
  "request": {
    "method": "POST",
    "path": "/accounts/confirm-email",
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
    "timestamp": "2026-10-30T13:14:24.729Z",
    "path": "/accounts/confirm-email"
  }
} satisfies CapturedResponse<ConfirmEmailErrors, 400>;
