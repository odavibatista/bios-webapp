// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { LogoutResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "logout",
  "scenario": "sucesso",
  "description": "Sessão deste dispositivo encerrada",
  "request": {
    "method": "POST",
    "path": "/auth/logout"
  },
  "status": 204,
  "headers": {},
  "body": null
} satisfies CapturedResponse<LogoutResponses, 204>;
