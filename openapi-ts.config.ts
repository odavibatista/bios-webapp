import { defineConfig } from '@hey-api/openapi-ts';

// Tipos dos modelos da API, gerados do documento OpenAPI do bios-core-api (`api/openapi.json`,
// exportado do CI da API). Só tipos: a versão de apresentação lê dados capturados, sem cliente HTTP.
export default defineConfig({
  // Com `./`: sem ele, o gerador lê o caminho como atalho do registro dele (`organização/projeto`).
  input: './api/openapi.json',
  output: './src/app/core/api/generated',
  plugins: ['@hey-api/typescript'],
});
