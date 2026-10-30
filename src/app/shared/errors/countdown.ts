import { effect, signal, type Signal } from '@angular/core';

/**
 * Contagem regressiva, em segundos, a partir do valor de `source` (ex.: `retry_after_seconds` de
 * um 429): recomeça quando a origem muda e para em zero. Chamar num contexto de injeção (campo ou
 * construtor de componente), porque usa `effect`.
 */
export function countdownFrom(source: Signal<number | null>): Signal<number> {
  const remaining = signal(0);

  effect((onCleanup) => {
    const seconds = source() ?? 0;

    remaining.set(seconds);
    if (seconds <= 0) return;

    const timer = setInterval(() => {
      remaining.update((value) => Math.max(value - 1, 0));
      if (remaining() === 0) clearInterval(timer);
    }, 1000);

    onCleanup(() => {
      clearInterval(timer);
    });
  });

  return remaining.asReadonly();
}
