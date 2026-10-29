import { formatDate, formatNumber } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { appConfig } from './app.config';

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
});
