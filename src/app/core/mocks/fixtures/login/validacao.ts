// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { LoginErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "login",
  "scenario": "validacao",
  "description": "Corpo fora das regras",
  "request": {
    "method": "POST",
    "path": "/auth/login",
    "body": {
      "email": "nao-e-email",
      "password": "<senha>"
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
        "path": "email",
        "message": "Informe um e-mail válido."
      },
      {
        "path": "password",
        "message": "Informe a senha."
      }
    ],
    "timestamp": "2026-10-30T13:14:25.726Z",
    "path": "/auth/login"
  }
} satisfies CapturedResponse<LoginErrors, 422>;
