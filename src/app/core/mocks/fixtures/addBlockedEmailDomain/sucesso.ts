// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { AddBlockedEmailDomainResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "addBlockedEmailDomain",
  "scenario": "sucesso",
  "description": "Domínio incluído pelo administrador",
  "request": {
    "method": "POST",
    "path": "/admin/blocked-email-domains",
    "body": {
      "domain": "caixa-temporaria-demonstracao.com"
    }
  },
  "status": 201,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "id": "6ae498830f3f8176322d3c12",
    "domain": "caixa-temporaria-demonstracao.com",
    "origin": "ADMIN",
    "created_at": "2026-10-30T13:15:47.950Z"
  }
} satisfies CapturedResponse<AddBlockedEmailDomainResponses, 201>;
