// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { ChangePasswordResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "changePassword",
  "scenario": "sucesso",
  "description": "Senha trocada; todas as sessões caem",
  "request": {
    "method": "POST",
    "path": "/auth/change-password",
    "body": {
      "current_password": "<senha>",
      "new_password": "<senha>"
    }
  },
  "status": 204,
  "headers": {},
  "body": null
} satisfies CapturedResponse<ChangePasswordResponses, 204>;
