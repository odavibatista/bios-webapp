import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import type { CompanyFullProfileResponse } from '../../../core/api/generated';
import { formatDateTime } from '../../../shared/format/date-time';
import {
  addressLines,
  companySizeLabel,
  formatCnae,
  registrationStatusLabel,
} from './registration-labels';

/**
 * Seção "Dados cadastrais" do perfil (UC06, passo 4; RF05, RF06; #24): situação, porte,
 * natureza jurídica, endereço e CNAEs com a descrição oficial. Só dados da pessoa jurídica: não há campo para sócio,
 * administrador ou contato (INL02).
 */
@Component({
  selector: 'bios-registration-data',
  templateUrl: './registration-data.html',
  styleUrl: './registration-data.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationData {
  readonly profile = input.required<CompanyFullProfileResponse>();

  protected readonly status = computed(() =>
    registrationStatusLabel(
      this.profile().registration_status,
      this.profile().registration_status_unrecognized,
    ),
  );
  protected readonly size = computed(() => companySizeLabel(this.profile().company_size));
  protected readonly address = computed(() => addressLines(this.profile().address));
  protected readonly refreshedAt = computed(() => formatDateTime(this.profile().refreshed_at));
  protected readonly formatCnae = formatCnae;
  protected readonly expanded = signal(false);
  protected readonly visibleSecondary = computed(() =>
    this.expanded() ? this.profile().secondary_cnaes : this.profile().secondary_cnaes.slice(0, 5),
  );

  protected toggleSecondary(): void {
    this.expanded.update((value) => !value);
  }
}
