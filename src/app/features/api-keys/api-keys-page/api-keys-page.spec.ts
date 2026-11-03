import { render, screen, within } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { ApiError } from '../../../core/api/api-error';
import { BiosApi } from '../../../core/api/bios-api';
import type {
  ApiKeyResponse,
  CreateApiKeyData,
  RevokeApiKeyData,
} from '../../../core/api/generated';
import { formatDateTime } from '../../../shared/format/date-time';
import { ApiKeysPage } from './api-keys-page';

const SECRET = 'bios_NovaChav_segredo-que-so-aparece-uma-vez';

const SEED: ApiKeyResponse = {
  id: 'k1',
  name: 'Planilha de fornecedores',
  prefix: 'bios_ZvdVkOaC',
  created_at: '2026-10-30T13:14:26.239Z',
  last_used_at: null,
};

const USED: ApiKeyResponse = {
  id: 'k2',
  name: 'Integração com o CRM',
  prefix: 'bios_AbCd1234',
  created_at: '2026-10-29T12:00:00.000Z',
  last_used_at: '2026-10-31T18:30:00.000Z',
};

function apiError(status: number, code: string, message: string, details?: unknown): ApiError {
  return new ApiError(status, {
    statusCode: status,
    code,
    message,
    details,
    timestamp: '2026-11-02T12:00:00.000Z',
    path: '/api-keys',
  });
}

/** Dublê com estado: lista, gera e revoga como a API, com as mensagens dela. */
function fakeApi(initial: ApiKeyResponse[]) {
  const keys = [...initial];

  return {
    keys,
    listApiKeys: vi.fn(() => Promise.resolve({ data: keys.map((key) => ({ ...key })) })),
    createApiKey: vi.fn(({ body }: { body: CreateApiKeyData['body'] }) => {
      const key: ApiKeyResponse = {
        id: `k${keys.length + 10}`,
        name: body.name,
        prefix: 'bios_NovaChav',
        created_at: '2026-11-02T12:00:00.000Z',
        last_used_at: null,
      };

      keys.unshift(key);

      return Promise.resolve({ ...key, key: SECRET });
    }),
    revokeApiKey: vi.fn(({ path }: { path: RevokeApiKeyData['path'] }) => {
      const index = keys.findIndex((key) => key.id === path.id);

      if (index < 0) {
        return Promise.reject(apiError(404, 'API_KEY_NOT_FOUND', 'Chave de API não encontrada.'));
      }
      keys.splice(index, 1);

      return Promise.resolve();
    }),
  };
}

async function renderPage(initial: ApiKeyResponse[] = [SEED, USED]) {
  const api = fakeApi(initial);
  const result = await render(ApiKeysPage, { providers: [{ provide: BiosApi, useValue: api }] });

  await screen.findByText(/chaves ativas\./);

  return { ...result, api, user: userEvent.setup() };
}

function rowOf(name: string): HTMLElement {
  const row = screen.getByRole('rowheader', { name }).closest('tr');
  if (!row) throw new Error(`linha de "${name}" não encontrada`);
  return row;
}

describe('ApiKeysPage', () => {
  it('lista só nome, prefixo, criação e último uso, com "Nunca usada" sem uso (regra 2)', async () => {
    await renderPage();

    expect(screen.getByText('2 de 10 chaves ativas.')).toBeTruthy();
    const seed = within(rowOf('Planilha de fornecedores'));
    expect(seed.getByText('bios_ZvdVkOaC')).toBeTruthy();
    expect(seed.getByText(formatDateTime(SEED.created_at))).toBeTruthy();
    expect(seed.getByText('Nunca usada')).toBeTruthy();
    expect(
      within(rowOf('Integração com o CRM')).getByText(formatDateTime('2026-10-31T18:30:00.000Z')),
    ).toBeTruthy();
    expect(screen.getAllByRole('columnheader').map((header) => header.textContent.trim())).toEqual([
      'Nome',
      'Prefixo',
      'Criada em',
      'Último uso',
      'Ações',
    ]);
  });

  it('sem chaves, explica e convida a gerar a primeira', async () => {
    const api = fakeApi([]);
    await render(ApiKeysPage, { providers: [{ provide: BiosApi, useValue: api }] });

    expect(
      await screen.findByText('Você ainda não tem chaves de API. Gere a primeira acima.'),
    ).toBeTruthy();
  });

  it('nome fora da regra não chega à API e recebe o erro, com o foco no campo', async () => {
    const { api, user, fixture } = await renderPage();

    await user.type(screen.getByLabelText('Nome de identificação'), ' a ');
    await user.click(screen.getByRole('button', { name: 'Gerar chave' }));
    await fixture.whenStable();

    expect(api.createApiKey).not.toHaveBeenCalled();
    expect(screen.getByText('O nome deve ter ao menos 2 caracteres.')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('Nome de identificação'));
  });

  it('gera a chave, mostra o valor completo uma vez e, fechado o diálogo, ele some da tela (NFSE01)', async () => {
    const { api, user } = await renderPage();

    await user.type(screen.getByLabelText('Nome de identificação'), '  Painel de compras  ');
    await user.click(screen.getByRole('button', { name: 'Gerar chave' }));

    expect(api.createApiKey).toHaveBeenCalledWith({ body: { name: 'Painel de compras' } });
    const dialog = await screen.findByRole('dialog', { name: 'Chave gerada' });
    expect(dialog.textContent).toContain(SECRET);

    await user.click(within(dialog).getByRole('button', { name: 'Já guardei a chave' }));

    expect(await screen.findByText('Chave “Painel de compras” gerada.')).toBeTruthy();
    await vi.waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(document.body.textContent).not.toContain(SECRET);
    expect(document.body.innerHTML).not.toContain(SECRET);
    expect(rowOf('Painel de compras')).toBeTruthy();
    expect(screen.getByText('3 de 10 chaves ativas.')).toBeTruthy();
    expect(screen.getByLabelText<HTMLInputElement>('Nome de identificação').value).toBe('');
    expect(
      screen
        .getByLabelText('Nome de identificação')
        .closest('mat-form-field')
        ?.classList.contains('mat-form-field-invalid'),
    ).toBe(false);
    expect(screen.queryByText('O nome deve ter ao menos 2 caracteres.')).toBeNull();
  });

  it('com 10 chaves ativas, a recusa da API explica o limite e sugere revogar (regra 5)', async () => {
    const { api, user } = await renderPage();
    api.createApiKey.mockRejectedValueOnce(
      apiError(
        422,
        'API_KEY_LIMIT_REACHED',
        'Você já tem 10 chaves de API ativas. Revogue uma para gerar outra.',
        { limit: 10 },
      ),
    );

    await user.type(screen.getByLabelText('Nome de identificação'), 'Mais uma');
    await user.click(screen.getByRole('button', { name: 'Gerar chave' }));

    expect((await screen.findByRole('alert')).textContent).toContain(
      'Você já tem 10 chaves de API ativas. Revogue uma para gerar outra.',
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('revogar pede confirmação, tira a chave da lista, avisa e leva o foco ao título da lista', async () => {
    const { api, user } = await renderPage();

    await user.click(
      within(rowOf('Integração com o CRM')).getByRole('button', {
        name: 'Revogar a chave Integração com o CRM',
      }),
    );
    const confirm = await screen.findByRole('alertdialog', {
      name: 'Revogar a chave “Integração com o CRM”?',
    });
    expect(api.revokeApiKey).not.toHaveBeenCalled();

    await user.click(within(confirm).getByRole('button', { name: 'Revogar' }));

    // A confirmação fecha de forma assíncrona; só então a revogação sai.
    await vi.waitFor(() => {
      expect(api.revokeApiKey).toHaveBeenCalledWith({ path: { id: 'k2' } });
    });
    expect(await screen.findByText('Chave “Integração com o CRM” revogada.')).toBeTruthy();
    await vi.waitFor(() => {
      expect(screen.queryByRole('rowheader', { name: 'Integração com o CRM' })).toBeNull();
    });
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Chaves ativas' }));
    });
  });

  it('cancelar a confirmação mantém a chave', async () => {
    const { api, user } = await renderPage();

    await user.click(
      screen.getByRole('button', { name: 'Revogar a chave Planilha de fornecedores' }),
    );
    await user.click(await screen.findByRole('button', { name: 'Cancelar' }));

    await vi.waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    expect(api.revokeApiKey).not.toHaveBeenCalled();
    expect(rowOf('Planilha de fornecedores')).toBeTruthy();
  });

  it('chave que já não existe (404) mostra a mensagem da API e atualiza a lista', async () => {
    const { api, user } = await renderPage();
    // Outra aba já revogou a chave: a lista desta está velha.
    api.keys.splice(0, 1);

    await user.click(
      screen.getByRole('button', { name: 'Revogar a chave Planilha de fornecedores' }),
    );
    await user.click(await screen.findByRole('button', { name: 'Revogar' }));

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Chave de API não encontrada. A lista foi atualizada.',
    );
    await vi.waitFor(() => {
      expect(screen.queryByRole('rowheader', { name: 'Planilha de fornecedores' })).toBeNull();
    });
    expect(api.listApiKeys).toHaveBeenCalledTimes(2);
  });

  it('explica como usar a chave na API pública e onde fica a documentação', async () => {
    await renderPage();

    const usage = screen.getByRole('region', { name: 'Como usar a chave' });
    expect(usage.textContent).toContain('x-api-key');
    expect(usage.textContent).toContain('GET /v1/companies/{cnpj}');
    expect(usage.textContent).toContain('/docs');
  });

  it('a tabela rola dentro do próprio contêiner, que recebe o foco pelo teclado', async () => {
    await renderPage();

    const region = screen.getByRole('region', { name: 'Tabela das chaves ativas' });
    expect(region.getAttribute('tabindex')).toBe('0');
    expect(within(region).getByRole('table')).toBeTruthy();
  });
});
