// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { ConfirmEmailChangeResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "confirmEmailChange",
  "scenario": "sucesso",
  "description": "Troca efetivada pelo link",
  "request": {
    "method": "POST",
    "path": "/accounts/confirm-email-change",
    "body": {
      "token": "token-do-link-de-demonstracao"
    }
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "message": "E-mail atualizado."
  }
} satisfies CapturedResponse<ConfirmEmailChangeResponses, 200>;
