// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.
import type { ListBlockedEmailDomainsResponses } from '../../../api/generated';
import type { CapturedResponse } from '../../capture';

export default {
  "operationId": "listBlockedEmailDomains",
  "scenario": "primeira-pagina",
  "description": "Primeira página da blacklist",
  "request": {
    "method": "GET",
    "path": "/admin/blocked-email-domains",
    "query": {
      "page": "1",
      "page_size": "20"
    }
  },
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8"
  },
  "body": {
    "data": [
      {
        "id": "6ae492078c79abc8bdc47883",
        "domain": "0-mail.com",
        "origin": "SEED",
        "created_at": "2026-10-30T12:48:07.940Z"
      },
      {
        "id": "6ae492078c79abc8bdc47884",
        "domain": "0clickemail.com",
        "origin": "SEED",
        "created_at": "2026-10-30T12:48:07.940Z"
      },
      {
        "id": "6ae492078c79abc8bdc47885",
        "domain": "10-minute-mail.com",
        "origin": "SEED",
        "created_at": "2026-10-30T12:48:07.940Z"
      },
      {
        "id": "6ae492078c79abc8bdc47886",
        "domain": "10dk.email",
        "origin": "SEED",
        "created_at": "2026-10-30T12:48:07.940Z"
      },
      {
        "id": "6ae492078c79abc8bdc47887",
        "domain": "10mail.com",
        "origin": "SEED",
        "created_at": "2026-10-30T12:48:07.940Z"
      },
      {
        "id": "6ae492078c79abc8bdc47888",
        "domain": "10mail.org",
        "origin": "SEED",
        "created_at": "2026-10-30T12:48:07.940Z"
      },
      {
        "id": "6ae492078c79abc8bdc47889",
        "domain": "10minut.com.pl",
        "origin": "SEED",
        "created_at": "2026-10-30T12:48:07.940Z"
      },
      {
        "id": "6ae492078c79abc8bdc4788a",
        "domain": "10minut.xyz",
        "origin": "SEED",
        "created_at": "2026-10-30T12:48:07.940Z"
      },
      {
        "id": "6ae492078c79abc8bdc4788b",
        "domain": "10minutemail.be",
        "origin": "SEED",
        "created_at": "2026-10-30T12:48:07.940Z"
      },
      {
        "id": "6ae492078c79abc8bdc4788c",
        "domain": "10minutemail.cf",
        "origin": "SEED",
        "created_at": "2026-10-30T12:48:07.940Z"
      },
      {
        "id": "6ae492078c79abc8bdc4788d",
        "domain": "10minutemail.co.uk",
        "origin": "SEED",
        "created_at": "2026-10-30T12:48:07.940Z"
      },
      {
        "id": "6ae492078c79abc8bdc4788e",
        "domain": "10minutemail.co.za",
        "origin": "SEED",
        "created_at": "2026-10-30T12:48:07.940Z"
      },
      {
        "id": "6ae492078c79abc8bdc4788f",
        "domain": "10minutemail.com",
        "origin": "SEED",
        "created_at": "2026-10-30T12:48:07.940Z"
      },
      {
        "id": "6ae492078c79abc8bdc47890",
        "domain": "10minutemail.de",
        "origin": "SEED",
        "created_at": "2026-10-30T12:48:07.940Z"
      },
      {
        "id": "6ae492078c79abc8bdc47891",
        "domain": "10minutemail.ga",
        "origin": "SEED",
        "created_at": "2026-10-30T12:48:07.940Z"
      },
      {
        "id": "6ae492078c79abc8bdc47892",
        "domain": "10minutemail.gq",
        "origin": "SEED",
        "created_at": "2026-10-30T12:48:07.940Z"
      },
      {
        "id": "6ae492078c79abc8bdc47893",
        "domain": "10minutemail.ml",
        "origin": "SEED",
        "created_at": "2026-10-30T12:48:07.940Z"
      },
      {
        "id": "6ae492078c79abc8bdc47894",
        "domain": "10minutemail.net",
        "origin": "SEED",
        "created_at": "2026-10-30T12:48:07.940Z"
      },
      {
        "id": "6ae492078c79abc8bdc47895",
        "domain": "10minutemail.nl",
        "origin": "SEED",
        "created_at": "2026-10-30T12:48:07.940Z"
      },
      {
        "id": "6ae492078c79abc8bdc47896",
        "domain": "10minutemail.pro",
        "origin": "SEED",
        "created_at": "2026-10-30T12:48:07.940Z"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 840,
      "total_pages": 42
    }
  }
} satisfies CapturedResponse<ListBlockedEmailDomainsResponses, 200>;
