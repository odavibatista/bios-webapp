// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { ChangePasswordErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "changePassword",
  "scenario": "validacao",
  "description": "Nova senha fora da política",
  "request": {
    "method": "POST",
    "path": "/auth/change-password",
    "body": {
      "current_password": "<senha>",
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
    "timestamp": "2026-10-30T13:14:33.813Z",
    "path": "/auth/change-password"
  }
} satisfies CapturedResponse<ChangePasswordErrors, 422>;
