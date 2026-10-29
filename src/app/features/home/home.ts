import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface OdsSummary {
  number: number;
  title: string;
  icon: string;
  sources: string[];
}

/** Os ODS que o BIOS calcula e as fontes de evidência de cada um (RF10). */
export const CALCULATED_ODS: readonly OdsSummary[] = [
  {
    number: 13,
    title: 'Ação contra a mudança global do clima',
    icon: 'thermostat',
    sources: ['Inventários de emissões do Registro Público do GHG Protocol'],
  },
  {
    number: 15,
    title: 'Vida terrestre',
    icon: 'forest',
    sources: ['Autos de infração e termos de embargo do IBAMA', 'Sanções do CEIS e do CNEP (CGU)'],
  },
];

/** Página inicial: o que o BIOS calcula e como ler o índice. */
@Component({
  selector: 'bios-home',
  imports: [MatCardModule, MatIconModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected readonly odsList = CALCULATED_ODS;
}
