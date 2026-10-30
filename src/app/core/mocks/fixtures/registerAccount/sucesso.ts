// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { RegisterAccountResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "registerAccount",
  "scenario": "sucesso",
  "description": "Cadastro aceito; o link de confirmação vai por e-mail",
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
