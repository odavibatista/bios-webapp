import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

/** Rota inexistente. */
@Component({
  selector: 'bios-not-found',
  imports: [MatButtonModule, RouterLink],
  template: `
    <h1>Página não encontrada</h1>
    <p>O endereço não corresponde a nenhuma página do BIOS.</p>
    <a mat-flat-button routerLink="/">Voltar ao início</a>
  `,
  styles: `
    h1 {
      font: var(--mat-sys-headline-medium);
      color: var(--bios-brand-green);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {}
