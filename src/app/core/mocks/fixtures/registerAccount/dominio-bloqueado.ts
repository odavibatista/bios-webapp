// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { RegisterAccountErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "registerAccount",
  "scenario": "dominio-bloqueado",
  "description": "Domínio da blacklist (RF22)",
  "request": {
    "method": "POST",
    "path": "/accounts",
    "body": {
      "name": "Conta de Demonstração",
      "email": "demonstracao@0-mail.com",
      "password": "<senha>"
    }
  },
  "status": 422,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "statusCode": 422,
    "code": "EMAIL_DOMAIN_NOT_ALLOWED",
    "message": "Não é possível usar este endereço de e-mail. Informe outro.",
    "timestamp": "2026-10-30T13:14:14.568Z",
    "path": "/accounts"
  }
} satisfies CapturedResponse<RegisterAccountErrors, 422>;
