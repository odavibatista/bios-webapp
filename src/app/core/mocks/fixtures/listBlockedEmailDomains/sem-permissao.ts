// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { ListBlockedEmailDomainsErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "listBlockedEmailDomains",
  "scenario": "sem-permissao",
  "description": "Conta USER na área de administração",
  "request": {
    "method": "GET",
    "path": "/admin/blocked-email-domains"
  },
  "status": 403,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "statusCode": 403,
    "code": "INSUFFICIENT_ROLE",
    "message": "Seu perfil de acesso não permite esta operação.",
    "timestamp": "2026-10-30T13:14:26.224Z",
    "path": "/admin/blocked-email-domains"
  }
} satisfies CapturedResponse<ListBlockedEmailDomainsErrors, 403>;
