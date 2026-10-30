// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { ConfirmEmailResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "confirmEmail",
  "scenario": "sucesso",
  "description": "Link de confirmação válido ativa a conta",
  "request": {
    "method": "POST",
    "path": "/accounts/confirm-email",
    "body": {
      "token": "token-do-link-de-demonstracao"
    }
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "message": "E-mail confirmado. Sua conta está ativa."
  }
} satisfies CapturedResponse<ConfirmEmailResponses, 200>;
