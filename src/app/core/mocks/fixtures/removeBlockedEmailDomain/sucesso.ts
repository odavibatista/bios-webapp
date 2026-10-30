// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { RemoveBlockedEmailDomainResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "removeBlockedEmailDomain",
  "scenario": "sucesso",
  "description": "Domínio removido",
  "request": {
    "method": "DELETE",
    "path": "/admin/blocked-email-domains/6ae498830f3f8176322d3c12"
  },
  "status": 204,
  "headers": {},
  "body": null
} satisfies CapturedResponse<RemoveBlockedEmailDomainResponses, 204>;
