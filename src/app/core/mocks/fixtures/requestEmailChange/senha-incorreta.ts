// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { RequestEmailChangeErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "requestEmailChange",
  "scenario": "senha-incorreta",
  "description": "Senha atual errada",
  "request": {
    "method": "POST",
    "path": "/accounts/me/email-change",
    "body": {
      "new_email": "apresentacao.nova@example.com",
      "current_password": "<senha>"
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
    "timestamp": "2026-10-30T13:14:26.623Z",
    "path": "/accounts/me/email-change"
  }
} satisfies CapturedResponse<RequestEmailChangeErrors, 422>;
