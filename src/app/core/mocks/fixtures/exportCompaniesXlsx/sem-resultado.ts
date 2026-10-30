// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { ExportCompaniesXlsxErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "exportCompaniesXlsx",
  "scenario": "sem-resultado",
  "description": "Nada para exportar",
  "request": {
    "method": "GET",
    "path": "/companies/export/xlsx",
    "query": {
      "name": "empresa inexistente demonstracao"
    }
  },
  "status": 404,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "statusCode": 404,
    "code": "NO_RESULTS_TO_EXPORT",
    "message": "Nenhuma empresa atende aos critérios informados: não há lista para exportar.",
    "timestamp": "2026-10-30T13:38:02.326Z",
    "path": "/companies/export/xlsx?name=empresa+inexistente+demonstracao"
  }
} satisfies CapturedResponse<ExportCompaniesXlsxErrors, 404>;
