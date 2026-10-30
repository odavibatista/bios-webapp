import { Injectable } from '@angular/core';

/**
 * Lê os arquivos binários capturados (as planilhas XLSX), publicados pelo build em `mocks/`
 * (`angular.json`, assets). Nos testes, uma implementação em memória toma o lugar desta.
 */
@Injectable({ providedIn: 'root' })
export class MockFiles {
  async load(operationId: string, file: string, contentType: string): Promise<Blob> {
    const response = await fetch(`mocks/${operationId}/${file}`);

    if (!response.ok) throw new Error(`Arquivo capturado ausente: ${operationId}/${file}`);

    return new Blob([await response.arrayBuffer()], { type: contentType });
  }
}
