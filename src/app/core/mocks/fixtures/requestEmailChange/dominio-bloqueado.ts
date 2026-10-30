// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { RequestEmailChangeErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "requestEmailChange",
  "scenario": "dominio-bloqueado",
  "description": "Novo e-mail na blacklist (RF22)",
  "request": {
    "method": "POST",
    "path": "/accounts/me/email-change",
    "body": {
      "new_email": "demonstracao@0-mail.com",
      "current_password": "<senha>"
    }
  },
  "status": 422,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "statusCode": 422,
    "code": "EMAIL_DOMAIN_NOT_ALLOWED",
    "message": "Não é possível usar este endereço de e-mail. Informe outro.",
    "timestamp": "2026-10-30T13:14:27.199Z",
    "path": "/accounts/me/email-change"
  }
} satisfies CapturedResponse<RequestEmailChangeErrors, 422>;
