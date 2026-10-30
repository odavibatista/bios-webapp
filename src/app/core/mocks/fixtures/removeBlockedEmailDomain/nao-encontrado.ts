// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { RemoveBlockedEmailDomainErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "removeBlockedEmailDomain",
  "scenario": "nao-encontrado",
  "description": "Domínio inexistente",
  "request": {
    "method": "DELETE",
    "path": "/admin/blocked-email-domains/ffffffffffffffffffffffff"
  },
  "status": 404,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "statusCode": 404,
    "code": "BLOCKED_EMAIL_DOMAIN_NOT_FOUND",
    "message": "Domínio não encontrado na blacklist.",
    "timestamp": "2026-10-30T13:15:48.009Z",
    "path": "/admin/blocked-email-domains/ffffffffffffffffffffffff"
  }
} satisfies CapturedResponse<RemoveBlockedEmailDomainErrors, 404>;
