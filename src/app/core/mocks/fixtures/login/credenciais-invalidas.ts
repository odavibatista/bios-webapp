// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { LoginErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "login",
  "scenario": "credenciais-invalidas",
  "description": "Senha incorreta: mesma mensagem de e-mail inexistente",
  "request": {
    "method": "POST",
    "path": "/auth/login",
    "body": {
      "email": "apresentacao@example.com",
      "password": "<senha>"
    }
  },
  "status": 401,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "statusCode": 401,
    "code": "INVALID_CREDENTIALS",
    "message": "E-mail ou senha incorretos.",
    "timestamp": "2026-10-30T13:14:25.721Z",
    "path": "/auth/login"
  }
} satisfies CapturedResponse<LoginErrors, 401>;
