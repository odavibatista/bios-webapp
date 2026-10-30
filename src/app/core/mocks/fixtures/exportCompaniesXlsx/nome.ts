// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { ExportCompaniesXlsxResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "exportCompaniesXlsx",
  "scenario": "nome",
  "description": "Planilha da busca por nome",
  "request": {
    "method": "GET",
    "path": "/companies/export/xlsx",
    "query": {
      "name": "gerdau"
    }
  },
  "status": 200,
  "headers": {
    "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "content-disposition": "attachment; filename=\"empresas-bios-2026-10-30.xlsx\""
  },
  "body": {
    "file": "nome.xlsx",
    "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "bytes": 3516
  }
} satisfies CapturedResponse<ExportCompaniesXlsxResponses, 200>;
