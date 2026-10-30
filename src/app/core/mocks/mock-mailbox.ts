import { Injectable, signal } from '@angular/core';

/** E-mail que a API mandaria, com o link que ele traria. */
export interface MockEmail {
  to: string;
  kind: 'confirmar-email' | 'redefinir-senha' | 'confirmar-novo-email';
  /** Caminho do link no app (`/confirmar-email/<token>`...), o mesmo dos e-mails da API. */
  link: string;
  sentAt: string;
}

/**
 * Caixa de saída da versão de apresentação: sem e-mail de verdade, o aviso "Modo apresentação"
 * mostra o link que o e-mail traria (decisão de 30/10/2026; FE-08, FE-11, FE-13).
 */
@Injectable({ providedIn: 'root' })
export class MockMailbox {
  private readonly sent = signal<readonly MockEmail[]>([]);

  /** Todos os e-mails, do mais antigo ao mais novo. */
  readonly emails = this.sent.asReadonly();

  send(email: MockEmail): void {
    this.sent.update((emails) => [...emails, email]);
  }

  /** O e-mail mais recente para este endereço e deste tipo. */
  latest(to: string, kind: MockEmail['kind']): MockEmail | undefined {
    return [...this.sent()]
      .reverse()
      .find((email) => email.to === to.trim().toLowerCase() && email.kind === kind);
  }
}
