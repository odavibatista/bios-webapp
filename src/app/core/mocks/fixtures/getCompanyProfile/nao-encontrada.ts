// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetCompanyProfileErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getCompanyProfile",
  "scenario": "nao-encontrada",
  "description": "CNPJ válido que a Receita não conhece (UC06, 3.3)",
  "request": {
    "method": "GET",
    "path": "/companies/99999998000147"
  },
  "status": 404,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "statusCode": 404,
    "code": "COMPANY_NOT_FOUND",
    "message": "Empresa não encontrada para o CNPJ informado.",
    "timestamp": "2026-10-30T13:38:00.820Z",
    "path": "/companies/99999998000147"
  }
} satisfies CapturedResponse<GetCompanyProfileErrors, 404>;
