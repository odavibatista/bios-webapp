// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { AddBlockedEmailDomainErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "addBlockedEmailDomain",
  "scenario": "duplicado",
  "description": "Domínio já bloqueado",
  "request": {
    "method": "POST",
    "path": "/admin/blocked-email-domains",
    "body": {
      "domain": "caixa-temporaria-demonstracao.com"
    }
  },
  "status": 409,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "statusCode": 409,
    "code": "BLOCKED_EMAIL_DOMAIN_ALREADY_EXISTS",
    "message": "Este domínio já está na blacklist.",
    "timestamp": "2026-10-30T13:15:47.969Z",
    "path": "/admin/blocked-email-domains"
  }
} satisfies CapturedResponse<AddBlockedEmailDomainErrors, 409>;
