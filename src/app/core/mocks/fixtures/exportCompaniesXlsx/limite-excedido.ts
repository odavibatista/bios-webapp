// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { ExportCompaniesXlsxErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "exportCompaniesXlsx",
  "scenario": "limite-excedido",
  "description": "Limite de exportações por minuto (Retry-After)",
  "request": {
    "method": "GET",
    "path": "/companies/export/xlsx",
    "query": {
      "name": "gerdau"
    }
  },
  "status": 429,
  "headers": {
    "content-type": "application/json; charset=utf-8",
    "retry-after": "60"
  },
  "body": {
    "statusCode": 429,
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Limite de requisições excedido. Tente novamente em instantes.",
    "details": {
      "limit": 10,
      "retry_after_seconds": 60
    },
    "timestamp": "2026-10-30T13:38:43.087Z",
    "path": "/companies/export/xlsx?name=gerdau"
  }
} satisfies CapturedResponse<ExportCompaniesXlsxErrors, 429>;
