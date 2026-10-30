// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { ConfirmEmailChangeErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "confirmEmailChange",
  "scenario": "email-ja-em-uso",
  "description": "O endereço passou a ser de outra conta antes da confirmação",
  "request": {
    "method": "POST",
    "path": "/accounts/confirm-email-change",
    "body": {
      "token": "token-do-link-de-demonstracao"
    }
  },
  "status": 409,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "statusCode": 409,
    "code": "EMAIL_ALREADY_IN_USE",
    "message": "Este e-mail já está em uso por outra conta.",
    "timestamp": "2026-10-30T13:14:31.604Z",
    "path": "/accounts/confirm-email-change"
  }
} satisfies CapturedResponse<ConfirmEmailChangeErrors, 409>;
