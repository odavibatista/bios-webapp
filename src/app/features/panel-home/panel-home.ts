import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { SessionStore } from '../../core/session/session-store';

interface Shortcut {
  title: string;
  description: string;
  icon: string;
  path: string;
}

/** Os caminhos de entrada da análise, na ordem em que a pessoa costuma usar. */
export const PANEL_SHORTCUTS: readonly Shortcut[] = [
  {
    title: 'Consultar uma empresa',
    description: 'Pelo CNPJ: índice de aderência, confiança e as evidências de cada ODS.',
    icon: 'domain',
    path: '/empresas',
  },
  {
    title: 'Pesquisar empresas',
    description: 'Por nome, setor ou UF, com ordenação pelo índice e exportação em planilha.',
    icon: 'manage_search',
    path: '/pesquisa',
  },
  {
    title: 'Comparar setores',
    description: 'A média do índice por setor econômico e a evolução ao longo do tempo.',
    icon: 'monitoring',
    path: '/setores',
  },
];

/** Entrada do painel depois do login (#18). */
@Component({
  selector: 'bios-panel-home',
  imports: [MatCardModule, MatIconModule, RouterLink],
  template: `
    <h1>Olá, {{ firstName() }}</h1>
    <p class="lead">Por onde você quer começar?</p>
    <ul class="shortcuts">
      @for (shortcut of shortcuts; track shortcut.path) {
        <li>
          <a class="shortcut" [routerLink]="shortcut.path">
            <mat-card appearance="outlined">
              <mat-card-header>
                <mat-icon mat-card-avatar fontSet="material-symbols-outlined" aria-hidden="true">
                  {{ shortcut.icon }}
                </mat-icon>
                <mat-card-title>{{ shortcut.title }}</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <p>{{ shortcut.description }}</p>
              </mat-card-content>
            </mat-card>
          </a>
        </li>
      }
    </ul>
  `,
  styles: `
    h1 {
      margin: 0 0 0.5rem;
      font: var(--mat-sys-headline-medium);
      color: var(--bios-brand-green);
    }

    .lead {
      margin: 0 0 1.5rem;
      color: var(--bios-brand-moss);
    }

    .shortcuts {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .shortcut {
      display: block;
      height: 100%;
      color: inherit;
      text-decoration: none;
      border-radius: var(--mat-sys-corner-medium);

      mat-card {
        height: 100%;
      }

      mat-icon {
        color: var(--bios-brand-green);
      }

      &:hover mat-card {
        border-color: var(--mat-sys-primary);
      }

      &:focus-visible {
        outline: 2px solid var(--mat-sys-primary);
        outline-offset: 2px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelHome {
  private readonly store = inject(SessionStore);

  protected readonly shortcuts = PANEL_SHORTCUTS;

  protected readonly firstName = computed(() => this.store.user()?.name.split(' ')[0] ?? '');
}
