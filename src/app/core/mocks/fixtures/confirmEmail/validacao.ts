// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { ConfirmEmailErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "confirmEmail",
  "scenario": "validacao",
  "description": "Token vazio",
  "request": {
    "method": "POST",
    "path": "/accounts/confirm-email",
    "body": {
      "token": ""
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
        "path": "token",
        "message": "Informe o token do link."
      }
    ],
    "timestamp": "2026-10-30T13:14:24.734Z",
    "path": "/accounts/confirm-email"
  }
} satisfies CapturedResponse<ConfirmEmailErrors, 422>;
