// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { ResendEmailConfirmationResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "resendEmailConfirmation",
  "scenario": "sucesso",
  "description": "Reenvio do link: mesma resposta exista ou não a conta",
  "request": {
    "method": "POST",
    "path": "/accounts/resend-confirmation",
    "body": {
      "email": "pendente@example.com"
    }
  },
  "status": 202,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "message": "Se houver uma conta aguardando confirmação para este e-mail, enviamos um novo link."
  }
} satisfies CapturedResponse<ResendEmailConfirmationResponses, 202>;
