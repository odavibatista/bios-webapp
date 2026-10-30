// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { LogoutAllDevicesResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "logoutAllDevices",
  "scenario": "sucesso",
  "description": "Todas as sessões da conta encerradas",
  "request": {
    "method": "POST",
    "path": "/auth/logout-all"
  },
  "status": 204,
  "headers": {},
  "body": null
} satisfies CapturedResponse<LogoutAllDevicesResponses, 204>;
