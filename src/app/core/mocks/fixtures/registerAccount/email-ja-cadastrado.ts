// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { RegisterAccountResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "registerAccount",
  "scenario": "email-ja-cadastrado",
  "description": "E-mail já cadastrado: mesma resposta do sucesso (RF01 b)",
  "request": {
    "method": "POST",
    "path": "/accounts",
    "body": {
      "name": "Conta de Demonstração",
      "email": "apresentacao@example.com",
      "password": "<senha>"
    }
  },
  "status": 202,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "message": "Se o e-mail puder ser cadastrado, enviamos um link de confirmação. Verifique sua caixa de entrada."
  }
} satisfies CapturedResponse<RegisterAccountResponses, 202>;
