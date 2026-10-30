// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { UpdateOwnAccountResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "updateOwnAccount",
  "scenario": "remover-endereco",
  "description": "Endereço removido (`address: null`)",
  "request": {
    "method": "PATCH",
    "path": "/accounts/me",
    "body": {
      "address": null
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
