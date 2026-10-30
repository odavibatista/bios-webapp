// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { ExportCompaniesXlsxErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "exportCompaniesXlsx",
  "scenario": "acima-do-teto",
  "description": "Lista maior que o teto de empresas por arquivo",
  "request": {
    "method": "GET",
    "path": "/companies/export/xlsx",
    "query": {
      "cnae": "24"
    }
  },
  "status": 422,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "statusCode": 422,
    "code": "EXPORT_TOO_LARGE",
    "message": "A pesquisa tem 10 empresas e uma exportação aceita até 3. Refine os critérios.",
    "details": {
      "total": 10,
      "max": 3
    },
    "timestamp": "2026-10-30T13:38:22.985Z",
    "path": "/companies/export/xlsx?cnae=24"
  }
} satisfies CapturedResponse<ExportCompaniesXlsxErrors, 422>;
