// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { RegisterAccountErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "registerAccount",
  "scenario": "validacao",
  "description": "Campos fora das regras",
  "request": {
    "method": "POST",
    "path": "/accounts",
    "body": {
      "name": "A",
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
        "path": "name",
        "message": "O nome deve ter ao menos 2 caracteres."
      },
      {
        "path": "email",
        "message": "Informe um e-mail válido."
      },
      {
        "path": "password",
        "message": "A senha deve ter ao menos 8 caracteres."
      },
      {
        "path": "password",
        "message": "A senha deve conter ao menos um número."
      }
    ],
    "timestamp": "2026-10-30T13:14:14.574Z",
    "path": "/accounts"
  }
} satisfies CapturedResponse<RegisterAccountErrors, 422>;
