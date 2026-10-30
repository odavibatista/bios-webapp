// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { RequestEmailChangeErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "requestEmailChange",
  "scenario": "mesmo-email",
  "description": "Novo e-mail igual ao atual",
  "request": {
    "method": "POST",
    "path": "/accounts/me/email-change",
    "body": {
      "new_email": "apresentacao@example.com",
      "current_password": "<senha>"
    }
  },
  "status": 422,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "statusCode": 422,
    "code": "EMAIL_UNCHANGED",
    "message": "O novo e-mail é igual ao atual.",
    "timestamp": "2026-10-30T13:14:26.912Z",
    "path": "/accounts/me/email-change"
  }
} satisfies CapturedResponse<RequestEmailChangeErrors, 422>;
