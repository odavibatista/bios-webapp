// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { UpdateOwnAccountResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "updateOwnAccount",
  "scenario": "nome",
  "description": "Troca do nome",
  "request": {
    "method": "PATCH",
    "path": "/accounts/me",
    "body": {
      "name": "Conta de Demonstração"
    }
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "id": "6ae498260f3f8176322d018e",
    "name": "Conta de Demonstração",
    "email": "apresentacao@example.com",
    "address": null,
    "role": "USER"
  }
} satisfies CapturedResponse<UpdateOwnAccountResponses, 200>;
