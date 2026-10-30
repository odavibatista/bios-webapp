// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { RequestEmailChangeResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "requestEmailChange",
  "scenario": "sucesso",
  "description": "Link enviado ao novo endereço; o atual vale até a confirmação",
  "request": {
    "method": "POST",
    "path": "/accounts/me/email-change",
    "body": {
      "new_email": "apresentacao.nova@example.com",
      "current_password": "<senha>"
    }
  },
  "status": 202,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "message": "Se o e-mail puder ser usado, enviamos um link de confirmação para ele. A troca só vale depois que você abrir o link."
  }
} satisfies CapturedResponse<RequestEmailChangeResponses, 202>;
