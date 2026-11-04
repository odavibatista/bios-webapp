import { Injectable } from '@angular/core';

/**
 * O que sobrevive a recarregar a página e acaba ao fechar a aba (`sessionStorage`). Só a versão de
 * apresentação fornece este serviço (`app.config.ts`): lá os tokens são do mock e não valem fora
 * da aba. Sem ele, a sessão fica só em memória (#15).
 *
 * Um navegador pode bloquear o armazenamento: nesse caso, a demonstração segue em memória.
 */
@Injectable()
export class TabStorage {
  read<T>(key: string): T | null {
    try {
      const saved = sessionStorage.getItem(key);

      return saved === null ? null : (JSON.parse(saved) as T);
    } catch {
      return null;
    }
  }

  write(key: string, value: unknown): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Sem armazenamento, recarregar recomeça a demonstração.
    }
  }

  remove(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Sem armazenamento, não há o que apagar.
    }
  }
}
