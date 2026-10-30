// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { AddBlockedEmailDomainErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "addBlockedEmailDomain",
  "scenario": "validacao",
  "description": "Texto que não é domínio",
  "request": {
    "method": "POST",
    "path": "/admin/blocked-email-domains",
    "body": {
      "domain": "não é domínio"
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
        "path": "domain",
        "message": "Domínio inválido: informe só o domínio, sem @ (ex.: mailinator.com)."
      }
    ],
    "timestamp": "2026-10-30T13:15:47.979Z",
    "path": "/admin/blocked-email-domains"
  }
} satisfies CapturedResponse<AddBlockedEmailDomainErrors, 422>;
