// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { UpdateOwnAccountResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "updateOwnAccount",
  "scenario": "endereco",
  "description": "Endereço gravado (cifrado na API)",
  "request": {
    "method": "PATCH",
    "path": "/accounts/me",
    "body": {
      "address": {
        "postal_code": "01310-200",
        "street": "Avenida Paulista",
        "number": "1578",
        "neighborhood": "Bela Vista",
        "city": "São Paulo",
        "state": "SP"
      }
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
    "address": {
      "postal_code": "01310200",
      "street": "Avenida Paulista",
      "number": "1578",
      "neighborhood": "Bela Vista",
      "city": "São Paulo",
      "state": "SP"
    },
    "role": "USER"
  }
} satisfies CapturedResponse<UpdateOwnAccountResponses, 200>;
