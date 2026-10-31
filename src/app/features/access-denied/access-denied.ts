import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

/** Área de outro papel: a pessoa entrou, mas o perfil dela não abre esta área (11-Permissões). */
@Component({
  selector: 'bios-access-denied',
  imports: [MatButtonModule, RouterLink],
  template: `
    <h1>Acesso negado</h1>
    <p>Seu perfil não permite acessar esta área.</p>
    <a mat-flat-button routerLink="/painel">Voltar ao painel</a>
  `,
  styles: `
    h1 {
      font: var(--mat-sys-headline-medium);
      color: var(--bios-brand-green);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessDenied {}
