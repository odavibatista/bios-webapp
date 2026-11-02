import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { screen, within } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { InMemoryApiCredentials } from '../../../core/api/api-credentials';
import { ApiError } from '../../../core/api/api-error';
import { BiosApi } from '../../../core/api/bios-api';
import { provideMockBiosApi } from '../../../core/mocks/provide-mock-bios-api';
import { formatDateTime } from '../../../shared/format/date-time';
import { BlockedDomainsPage, originLabel } from './blocked-domains-page';

/** Abre a página com uma sessão de administrador no mock real (20 domínios da carga inicial). */
async function openPage() {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{ path: 'admin', component: BlockedDomainsPage }]),
      provideMockBiosApi({ latencyMs: 0 }),
    ],
  });
  const api = TestBed.inject(BiosApi);
  const session = await api.login({
    body: { email: 'administracao@example.com', password: 'Apresentacao2026' },
  });
  TestBed.inject(InMemoryApiCredentials).setAccessToken(session.access_token);
  await RouterTestingHarness.create('/admin');
  await screen.findByText(/domínios bloqueados, em ordem alfabética/);

  return { api, user: userEvent.setup() };
}

function domainsShown(): string[] {
  return screen.getAllByRole('rowheader').map((cell) => cell.textContent.trim());
}

async function block(user: ReturnType<typeof userEvent.setup>, domain: string) {
  await user.clear(screen.getByLabelText('Domínio'));
  if (domain) await user.type(screen.getByLabelText('Domínio'), domain);
  await user.click(screen.getByRole('button', { name: 'Bloquear domínio' }));
}

describe('BlockedDomainsPage', () => {
  it('lista em ordem alfabética, com origem e data, e diz o total', async () => {
    const { api } = await openPage();
    const first = (await api.listBlockedEmailDomains()).data[0];

    expect(screen.getByText('20 domínios bloqueados, em ordem alfabética.')).toBeTruthy();
    const shown = domainsShown();
    expect(shown).toEqual([...shown].sort((a, b) => a.localeCompare(b)));
    const row = within(screen.getByRole('rowheader', { name: first.domain }).closest('tr')!);
    expect(row.getByText('Carga inicial')).toBeTruthy();
    expect(row.getByText(formatDateTime(first.created_at))).toBeTruthy();
    // Uma página só: sem navegação de páginas.
    expect(screen.queryByRole('navigation', { name: 'Páginas da blacklist' })).toBeNull();
  });

  it('inclui o domínio em minúsculas e sem os espaços, avisa e atualiza a lista', async () => {
    const { api, user } = await openPage();
    const add = vi.spyOn(api, 'addBlockedEmailDomain');

    await block(user, '  Caixa-Temporaria.Example  ');

    expect(add).toHaveBeenCalledWith({ body: { domain: 'caixa-temporaria.example' } });
    expect((await screen.findByRole('status')).textContent).toContain(
      'Domínio caixa-temporaria.example bloqueado.',
    );
    expect(await screen.findByText('21 domínios bloqueados, em ordem alfabética.')).toBeTruthy();
    expect(screen.getByLabelText<HTMLInputElement>('Domínio').value).toBe('');
  });

  it('domínio fora do formato não sai da tela e marca o campo com a mensagem da API', async () => {
    const { api, user } = await openPage();
    const add = vi.spyOn(api, 'addBlockedEmailDomain');

    await block(user, 'pessoa@mailinator.com');

    expect(add).not.toHaveBeenCalled();
    const field = screen.getByLabelText('Domínio');
    expect(field.getAttribute('aria-invalid')).toBe('true');
    expect(
      screen.getByText('Domínio inválido: informe só o domínio, sem @ (ex.: mailinator.com).'),
    ).toBeTruthy();
    expect(document.activeElement).toBe(field);
  });

  it('domínio já bloqueado: o aviso da API fica no campo (409)', async () => {
    const { api, user } = await openPage();
    const existing = (await api.listBlockedEmailDomains()).data[3].domain;

    await block(user, existing.toUpperCase());

    expect(await screen.findByText('Este domínio já está na blacklist.')).toBeTruthy();
    expect(screen.getByLabelText('Domínio').getAttribute('aria-invalid')).toBe('true');
  });

  it('remover pede confirmação; cancelar mantém o domínio', async () => {
    const { api, user } = await openPage();
    const remove = vi.spyOn(api, 'removeBlockedEmailDomain');
    const target = domainsShown()[0];

    await user.click(screen.getByRole('button', { name: `Remover ${target} da blacklist` }));
    expect(
      await screen.findByRole('alertdialog', { name: `Remover ${target} da blacklist?` }),
    ).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    await vi.waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    expect(remove).not.toHaveBeenCalled();
    expect(domainsShown()).toContain(target);
  });

  it('confirmar remove o domínio da lista, avisa e leva o foco ao título da lista', async () => {
    const { user } = await openPage();
    const target = domainsShown()[0];

    await user.click(screen.getByRole('button', { name: `Remover ${target} da blacklist` }));
    await user.click(await screen.findByRole('button', { name: 'Remover' }));

    expect((await screen.findByRole('status')).textContent).toBe(
      `Domínio ${target} removido da blacklist.`,
    );
    await vi.waitFor(() => {
      expect(domainsShown()).not.toContain(target);
    });
    expect(screen.getByText('19 domínios bloqueados, em ordem alfabética.')).toBeTruthy();
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Blacklist' }));
    });
  });

  it('domínio que já não está na blacklist (404): avisa e atualiza a lista', async () => {
    const { api, user } = await openPage();
    const list = vi.spyOn(api, 'listBlockedEmailDomains');
    vi.spyOn(api, 'removeBlockedEmailDomain').mockRejectedValueOnce(
      new ApiError(404, {
        statusCode: 404,
        code: 'BLOCKED_EMAIL_DOMAIN_NOT_FOUND',
        message: 'Domínio não encontrado na blacklist.',
        timestamp: '2026-11-02T12:00:00.000Z',
        path: '/admin/blocked-email-domains/x',
      }),
    );
    const target = domainsShown()[0];

    await user.click(screen.getByRole('button', { name: `Remover ${target} da blacklist` }));
    await user.click(await screen.findByRole('button', { name: 'Remover' }));

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Domínio não encontrado na blacklist. A lista foi atualizada.',
    );
    expect(list).toHaveBeenCalled();
  });

  it('com mais de uma página, navega pelas páginas', async () => {
    const { user } = await openPage();

    for (const domain of ['zz-1.example', 'zz-2.example']) {
      await block(user, domain);
      await screen.findByText(`Domínio ${domain} bloqueado.`, { exact: false });
    }

    const pager = await screen.findByRole('navigation', { name: 'Páginas da blacklist' });
    expect(within(pager).getByText('Página 1 de 2')).toBeTruthy();
    expect(within(pager).getByRole('button', { name: 'Página anterior' })).toHaveProperty(
      'disabled',
      true,
    );

    await user.click(within(pager).getByRole('button', { name: 'Próxima página' }));

    expect(await screen.findByText('Página 2 de 2')).toBeTruthy();
    expect(domainsShown()).toEqual(['zz-1.example', 'zz-2.example']);
  });

  it('remover o único domínio da última página volta à página anterior', async () => {
    const { user } = await openPage();

    await block(user, 'zz-unico.example');
    await screen.findByText('Domínio zz-unico.example bloqueado.', { exact: false });
    await user.click(await screen.findByRole('button', { name: 'Próxima página' }));
    await screen.findByText('Página 2 de 2');

    await user.click(screen.getByRole('button', { name: 'Remover zz-unico.example da blacklist' }));
    await user.click(await screen.findByRole('button', { name: 'Remover' }));

    await vi.waitFor(() => {
      expect(domainsShown()).toHaveLength(20);
    });
    expect(screen.queryByRole('navigation', { name: 'Páginas da blacklist' })).toBeNull();
  });

  it('a origem aparece em português', () => {
    expect(originLabel('SEED')).toBe('Carga inicial');
    expect(originLabel('ADMIN')).toBe('Administrador');
  });
});
