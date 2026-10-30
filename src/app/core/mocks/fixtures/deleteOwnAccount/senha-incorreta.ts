// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { DeleteOwnAccountErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "deleteOwnAccount",
  "scenario": "senha-incorreta",
  "description": "Senha errada: a conta continua",
  "request": {
    "method": "DELETE",
    "path": "/accounts/me",
    "body": {
      "password": "<senha>"
    }
  },
  "status": 422,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "statusCode": 422,
    "code": "INVALID_CURRENT_PASSWORD",
    "message": "A senha atual está incorreta.",
    "timestamp": "2026-10-30T13:38:55.249Z",
    "path": "/accounts/me"
  }
} satisfies CapturedResponse<DeleteOwnAccountErrors, 422>;
