// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { ForgotPasswordResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "forgotPassword",
  "scenario": "email-desconhecido",
  "description": "E-mail sem conta: mesma resposta (RF25 b)",
  "request": {
    "method": "POST",
    "path": "/auth/forgot-password",
    "body": {
      "email": "ninguem@example.com"
    }
  },
  "status": 202,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "message": "Se houver uma conta ativa com este e-mail, enviamos um link para redefinir a senha."
  }
} satisfies CapturedResponse<ForgotPasswordResponses, 202>;
