import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, NavigationStart, Router, Scroll, type Event } from '@angular/router';
import { Subject } from 'rxjs';
import { ScrollMemory } from './scroll-memory';

describe('ScrollMemory', () => {
  let events: Subject<Event>;
  let scrollTo: ReturnType<typeof vi.fn>;

  const end = (url: string) => new NavigationEnd(1, url, url);
  const goBack = () => {
    events.next(new Scroll(end('/painel'), [0, 1200], null));
  };
  const frames = () => {
    vi.advanceTimersByTime(100);
  };
  const expectStopped = () => {
    scrollTo.mockClear();
    frames();

    expect(scrollTo).not.toHaveBeenCalled();
  };

  beforeEach(() => {
    vi.useFakeTimers();
    events = new Subject();
    scrollTo = vi.fn();
    TestBed.configureTestingModule({ providers: [{ provide: Router, useValue: { events } }] });
    Object.defineProperty(TestBed.inject(DOCUMENT).defaultView, 'scrollTo', {
      value: scrollTo,
      configurable: true,
    });
    TestBed.inject(ScrollMemory).start();
    events.next(end('/painel'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('a primeira tela não rola', () => {
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('outra tela abre no topo', () => {
    events.next(end('/empresas/123'));

    expect(scrollTo).toHaveBeenCalledExactlyOnceWith(0, 0);
  });

  it('trocar só os parâmetros não mexe na rolagem', () => {
    events.next(end('/painel?pagina=2'));

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('voltar repete a posição enquanto a página cresce', () => {
    goBack();
    frames();

    expect(scrollTo.mock.calls.length).toBeGreaterThan(1);
    expect(scrollTo).toHaveBeenLastCalledWith(0, 1200);
  });

  it('para no fim do prazo', () => {
    goBack();
    vi.advanceTimersByTime(3_000);

    expectStopped();
  });

  it('a pessoa rolando encerra a volta à posição', () => {
    goBack();
    TestBed.inject(DOCUMENT).defaultView?.dispatchEvent(new window.Event('wheel'));

    expectStopped();
  });

  it('nova navegação encerra a volta à posição', () => {
    goBack();
    events.next(new NavigationStart(2, '/setores'));

    expectStopped();
  });
});
