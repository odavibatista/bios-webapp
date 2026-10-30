import { formatDate, formatNumber } from '@angular/common';
import { inject, Injectable, LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { appConfig } from './app.config';
import { ApiCredentials, InMemoryApiCredentials } from './core/api/api-credentials';
import { BiosApi } from './core/api/bios-api';
import { MockBiosApi } from './core/mocks/mock-bios-api';

/** Um consumidor qualquer do contrato, como as telas serão. */
@Injectable({ providedIn: 'root' })
class OdsCounter {
  private readonly api = inject(BiosApi);

  async count(): Promise<number> {
    return (await this.api.listOds()).data.length;
  }
}

describe('appConfig', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: appConfig.providers });
  });

  it('usa o locale pt-BR', () => {
    expect(TestBed.inject(LOCALE_ID)).toBe('pt-BR');
  });

  it('formata números e datas no padrão brasileiro', () => {
    const locale = TestBed.inject(LOCALE_ID);

    expect(formatNumber(1234.5, locale, '1.1-1')).toBe('1.234,5');
    expect(formatDate('2026-10-29T12:00:00Z', 'dd/MM/yyyy', locale, 'UTC')).toBe('29/10/2026');
  });

  it('a versão de apresentação liga o contrato à implementação mockada', () => {
    expect(TestBed.inject(BiosApi)).toBeInstanceOf(MockBiosApi);
    expect(TestBed.inject(ApiCredentials)).toBe(TestBed.inject(InMemoryApiCredentials));
  });
});

describe('troca de provedor', () => {
  it('outra implementação do contrato é usada sem mudar quem o consome', async () => {
    const alternative: Pick<BiosApi, 'listOds'> = {
      listOds: () =>
        Promise.resolve({
          data: [{ ods_number: 13, title: 'Clima', description: 'Ação climática.' }],
        }),
    };

    TestBed.configureTestingModule({
      providers: [...appConfig.providers, { provide: BiosApi, useValue: alternative }],
    });

    await expect(TestBed.inject(OdsCounter).count()).resolves.toBe(1);
  });
});
