// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { ExportCompaniesXlsxResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "exportCompaniesXlsx",
  "scenario": "setor-ods-13-desc",
  "description": "Planilha da divisão 24 pelo ODS 13",
  "request": {
    "method": "GET",
    "path": "/companies/export/xlsx",
    "query": {
      "cnae": "24",
      "ods": "13",
      "order": "desc"
    }
  },
  "status": 200,
  "headers": {
    "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "content-disposition": "attachment; filename=\"empresas-bios-2026-10-30.xlsx\""
  },
  "body": {
    "file": "setor-ods-13-desc.xlsx",
    "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "bytes": 4367
  }
} satisfies CapturedResponse<ExportCompaniesXlsxResponses, 200>;
