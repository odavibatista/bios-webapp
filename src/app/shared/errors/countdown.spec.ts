import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { countdownFrom } from './countdown';

describe('countdownFrom', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('conta para baixo de segundo em segundo e para em zero', () => {
    const source = signal<number | null>(3);
    const remaining = TestBed.runInInjectionContext(() => countdownFrom(source));

    TestBed.tick();
    expect(remaining()).toBe(3);

    vi.advanceTimersByTime(1000);
    expect(remaining()).toBe(2);

    vi.advanceTimersByTime(5000);
    expect(remaining()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('recomeça quando a origem muda, e sem prazo fica em zero', () => {
    const source = signal<number | null>(10);
    const remaining = TestBed.runInInjectionContext(() => countdownFrom(source));

    TestBed.tick();
    vi.advanceTimersByTime(4000);
    source.set(null);
    TestBed.tick();

    expect(remaining()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });
});
