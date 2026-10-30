// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { GetScoreExplanationErrors } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "getScoreExplanation",
  "scenario": "ods-nao-calculado",
  "description": "ODS que o BIOS não calcula",
  "request": {
    "method": "GET",
    "path": "/companies/60894730000105/scores/7/explanation"
  },
  "status": 404,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "statusCode": 404,
    "code": "SCORE_NOT_FOUND",
    "message": "Índice não calculado para a empresa e o ODS informados.",
    "timestamp": "2026-10-30T13:37:59.968Z",
    "path": "/companies/60894730000105/scores/7/explanation"
  }
} satisfies CapturedResponse<GetScoreExplanationErrors, 404>;
