import { DOCUMENT } from '@angular/common';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationError, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { handleNavigationFailure, isChunkFailure } from './navigation-failure';

const CHUNK = new TypeError('Failed to fetch dynamically imported module: /chunk-ABC.js');

describe('falha ao abrir uma tela', () => {
  const action = new Subject<void>();
  const open = vi.fn(() => ({ onAction: () => action }));
  const assign = vi.fn();
  const navigateByUrl = vi.fn();
  let view: {
    navigator: { onLine: boolean };
    location: { assign: typeof assign };
    sessionStorage: Storage;
  };

  function fail(error: unknown = CHUNK) {
    runInInjectionContext(TestBed.inject(EnvironmentInjector), () => {
      handleNavigationFailure(new NavigationError(1, '/setores', error));
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    view = { navigator: { onLine: true }, location: { assign }, sessionStorage };
    TestBed.configureTestingModule({
      providers: [
        { provide: DOCUMENT, useValue: { defaultView: view } },
        { provide: MatSnackBar, useValue: { open } },
        { provide: Router, useValue: { navigateByUrl } },
      ],
    });
  });

  it.each([
    ['Failed to fetch dynamically imported module: /a.js'],
    ['Importing a module script failed.'],
    ['error loading dynamically imported module: /a.js'],
  ])('reconhece o arquivo que não veio: %s', (message) => {
    expect(isChunkFailure(new TypeError(message))).toBe(true);
  });

  it('outra falha não é tratada aqui', () => {
    expect(isChunkFailure(new Error('Guarda recusou'))).toBe(false);

    fail(new Error('Guarda recusou'));

    expect(assign).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
  });

  it('depois de um deploy, recarrega uma vez, na tela pedida', () => {
    fail();

    expect(assign).toHaveBeenCalledExactlyOnceWith('/setores');
    expect(open).not.toHaveBeenCalled();
  });

  it('a recarga não vira laço: a segunda falha avisa', () => {
    fail();
    fail();

    expect(assign).toHaveBeenCalledOnce();
    expect(open).toHaveBeenCalledOnce();
  });

  it('sem conexão, avisa, e "Tentar de novo" repete a navegação', () => {
    view.navigator.onLine = false;

    fail();
    action.next();

    expect(assign).not.toHaveBeenCalled();
    expect(open).toHaveBeenCalledWith(
      'Não foi possível abrir a tela. Confira a conexão.',
      'Tentar de novo',
      { duration: 0 },
    );
    expect(navigateByUrl).toHaveBeenCalledWith('/setores');
  });

  it('com o armazenamento bloqueado, avisa em vez de arriscar um laço', () => {
    view.sessionStorage = {
      getItem: () => {
        throw new Error('bloqueado');
      },
    } as unknown as Storage;

    fail();

    expect(assign).not.toHaveBeenCalled();
    expect(open).toHaveBeenCalledOnce();
  });
});
