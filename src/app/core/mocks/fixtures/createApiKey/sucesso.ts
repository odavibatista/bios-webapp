// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { CreateApiKeyResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "createApiKey",
  "scenario": "sucesso",
  "description": "Chave criada: o segredo aparece só nesta resposta",
  "request": {
    "method": "POST",
    "path": "/api-keys",
    "body": {
      "name": "Planilha de fornecedores"
    }
  },
  "status": 201,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "id": "6ae498320f3f8176322d08d4",
    "name": "Planilha de fornecedores",
    "prefix": "bios_ZvdVkOaC",
    "created_at": "2026-10-30T13:14:26.239Z",
    "last_used_at": null,
    "key": "bios_ZvdVkOaC_segredo-de-demonstracao"
  }
} satisfies CapturedResponse<CreateApiKeyResponses, 201>;
