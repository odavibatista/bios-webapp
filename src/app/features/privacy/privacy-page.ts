import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PRIVACY_CONTACT } from './privacy-contact';

/** Como o BIOS trata dados pessoais e como o titular pede a remoção (NFSE02). */
@Component({
  selector: 'bios-privacy-page',
  imports: [RouterLink],
  templateUrl: './privacy-page.html',
  styleUrl: './privacy-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyPage {
  protected readonly contact = PRIVACY_CONTACT;
  protected readonly contactLink = `mailto:${PRIVACY_CONTACT}?subject=${encodeURIComponent(
    'Pedido sobre dados no BIOS',
  )}`;
}
