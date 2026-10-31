import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { requireRole, withSession, type Role } from './role.guards';
import { SessionStore } from './session-store';

@Component({ template: 'tela' })
class Screen {}

function signInAs(role: Role): void {
  TestBed.inject(SessionStore).store({
    access_token: 'a',
    refresh_token: 'r',
    token_type: 'Bearer',
    expires_in: 900,
    user: { id: '1', name: 'Conta de Demonstração', role },
  });
}

describe('guards de papel', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'admin',
            canActivateChild: [requireRole('ADMIN')],
            children: [{ path: 'x', component: Screen }],
          },
          { path: 'acesso-negado', component: Screen },
          { path: 'privada', canMatch: [withSession], component: Screen },
          { path: '**', component: Screen },
        ]),
      ],
    });
  });

  it('USER na área de administração vai para "acesso negado"', async () => {
    signInAs('USER');
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/admin/x');

    expect(TestBed.inject(Router).url).toBe('/acesso-negado');
  });

  it('ADMIN entra na área de administração', async () => {
    signInAs('ADMIN');
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/admin/x');

    expect(TestBed.inject(Router).url).toBe('/admin/x');
  });

  it('a rota com sessão só casa para quem entrou', async () => {
    const harness = await RouterTestingHarness.create();
    const router = TestBed.inject(Router);

    await harness.navigateByUrl('/privada');
    expect(router.getCurrentNavigation()).toBeNull();
    expect(router.routerState.snapshot.root.firstChild?.routeConfig?.path).toBe('**');

    signInAs('USER');
    await harness.navigateByUrl('/privada?x=1');
    expect(router.routerState.snapshot.root.firstChild?.routeConfig?.path).toBe('privada');
  });
});
