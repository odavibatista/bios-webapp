// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetCompanyProfileErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getCompanyProfile",
  "scenario": "cnpj-invalido",
  "description": "CNPJ com dígitos verificadores errados",
  "request": {
    "method": "GET",
    "path": "/companies/12345678000100"
  },
  "status": 422,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "statusCode": 422,
    "code": "INVALID_CNPJ",
    "message": "CNPJ inválido. Confira os dígitos e tente de novo.",
    "timestamp": "2026-10-30T13:37:59.974Z",
    "path": "/companies/12345678000100"
  }
} satisfies CapturedResponse<GetCompanyProfileErrors, 422>;
