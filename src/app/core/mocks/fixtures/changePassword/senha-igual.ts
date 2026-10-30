// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { ChangePasswordErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "changePassword",
  "scenario": "senha-igual",
  "description": "Nova senha igual à atual",
  "request": {
    "method": "POST",
    "path": "/auth/change-password",
    "body": {
      "current_password": "<senha>",
      "new_password": "<senha>"
    }
  },
  "status": 422,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "statusCode": 422,
    "code": "PASSWORD_UNCHANGED",
    "message": "A nova senha deve ser diferente da atual.",
    "timestamp": "2026-10-30T13:14:33.807Z",
    "path": "/auth/change-password"
  }
} satisfies CapturedResponse<ChangePasswordErrors, 422>;
