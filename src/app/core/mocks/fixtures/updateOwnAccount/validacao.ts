// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { UpdateOwnAccountErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "updateOwnAccount",
  "scenario": "validacao",
  "description": "CEP e UF inválidos",
  "request": {
    "method": "PATCH",
    "path": "/accounts/me",
    "body": {
      "address": {
        "postal_code": "123",
        "street": "Avenida Paulista",
        "number": "1578",
        "neighborhood": "Bela Vista",
        "city": "São Paulo",
        "state": "XX"
      }
    }
  },
  "status": 422,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "statusCode": 422,
    "code": "VALIDATION_FAILED",
    "message": "Os dados enviados são inválidos.",
    "details": [
      {
        "path": "address.postal_code",
        "message": "Informe um CEP válido (8 dígitos)."
      },
      {
        "path": "address.state",
        "message": "Informe a sigla de uma unidade da federação."
      }
    ],
    "timestamp": "2026-10-30T13:14:26.165Z",
    "path": "/accounts/me"
  }
} satisfies CapturedResponse<UpdateOwnAccountErrors, 422>;
