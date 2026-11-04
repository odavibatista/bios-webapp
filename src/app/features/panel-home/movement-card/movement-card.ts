import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import type { CompanyMovementItem, OdsMovement } from '../../../core/api/generated';
import { formatCnpj, formatConfidence, formatScore } from '../../search/search-format';
import { causeLabel, directionView, formatMovementDate } from '../movement-format';

/**
 * Uma empresa da lista de movimentações (UC18): quem é, como está em cada ODS e o que mudou por
 * último. O cartão inteiro leva ao perfil, onde a mudança é explicada evidência a evidência.
 * Não mostra índice anterior nem variação (IND03): o índice e a confiança são os atuais.
 */
@Component({
  selector: 'bios-movement-card',
  imports: [MatIconModule, RouterLink],
  templateUrl: './movement-card.html',
  styleUrl: './movement-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovementCard {
  readonly item = input.required<CompanyMovementItem>();

  protected readonly cnpj = computed(() => formatCnpj(this.item().cnpj));
  protected readonly score = formatScore;
  protected readonly confidence = formatConfidence;
  protected readonly date = formatMovementDate;
  protected readonly cause = causeLabel;

  protected view(movement: OdsMovement) {
    return directionView(movement.direction);
  }
}
