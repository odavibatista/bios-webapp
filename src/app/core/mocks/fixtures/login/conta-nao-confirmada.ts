// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { LoginErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "login",
  "scenario": "conta-nao-confirmada",
  "description": "Senha certa, e-mail ainda não confirmado (UC02, 3.4)",
  "request": {
    "method": "POST",
    "path": "/auth/login",
    "body": {
      "email": "pendente@example.com",
      "password": "<senha>"
    }
  },
  "status": 403,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "statusCode": 403,
    "code": "ACCOUNT_NOT_CONFIRMED",
    "message": "Confirme seu e-mail para acessar. Se precisar, solicite um novo link.",
    "timestamp": "2026-10-30T13:14:25.391Z",
    "path": "/auth/login"
  }
} satisfies CapturedResponse<LoginErrors, 403>;
