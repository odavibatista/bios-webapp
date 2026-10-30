// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { DeleteOwnAccountResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "deleteOwnAccount",
  "scenario": "sucesso",
  "description": "Conta e dados pessoais removidos",
  "request": {
    "method": "DELETE",
    "path": "/accounts/me",
    "body": {
      "password": "<senha>"
    }
  },
  "status": 204,
  "headers": {},
  "body": null
} satisfies CapturedResponse<DeleteOwnAccountResponses, 204>;
