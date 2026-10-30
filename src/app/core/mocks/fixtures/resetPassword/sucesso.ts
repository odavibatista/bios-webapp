// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { ResetPasswordResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "resetPassword",
  "scenario": "sucesso",
  "description": "O mesmo link grava a senha nova",
  "request": {
    "method": "POST",
    "path": "/auth/reset-password",
    "body": {
      "token": "token-do-link-de-demonstracao",
      "new_password": "<senha>"
    }
  },
  "status": 204,
  "headers": {},
  "body": null
} satisfies CapturedResponse<ResetPasswordResponses, 204>;
