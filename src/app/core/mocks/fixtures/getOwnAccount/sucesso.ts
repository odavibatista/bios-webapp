// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetOwnAccountResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getOwnAccount",
  "scenario": "sucesso",
  "description": "Dados da própria conta",
  "request": {
    "method": "GET",
    "path": "/accounts/me"
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
} satisfies CapturedResponse<GetOwnAccountResponses, 200>;
