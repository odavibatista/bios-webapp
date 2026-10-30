// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { ResetPasswordErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "resetPassword",
  "scenario": "senha-fora-da-politica",
  "description": "Senha nova inválida não gasta o link (UC04, regra 6)",
  "request": {
    "method": "POST",
    "path": "/auth/reset-password",
    "body": {
      "token": "token-do-link-de-demonstracao",
      "new_password": "<senha>"
    }
  },
  "status": 422,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "statusCode": 422,
    "code": "VALIDATION_FAILED",
    "message": "Os dados enviados são inválidos.",
    "details": [
      {
        "path": "new_password",
        "message": "A senha deve ter ao menos 8 caracteres."
      },
      {
        "path": "new_password",
        "message": "A senha deve conter ao menos um número."
      }
    ],
    "timestamp": "2026-10-30T13:14:35.731Z",
    "path": "/auth/reset-password"
  }
} satisfies CapturedResponse<ResetPasswordErrors, 422>;
