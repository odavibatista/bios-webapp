import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { fireEvent, render, screen, within } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { InMemoryApiCredentials } from '../../../core/api/api-credentials';
import { ApiError } from '../../../core/api/api-error';
import { BiosApi } from '../../../core/api/bios-api';
import { provideMockBiosApi } from '../../../core/mocks/provide-mock-bios-api';
import { SessionStore } from '../../../core/session/session-store';
import { AccountPage } from './account-page';

const USER = 'apresentacao@example.com';
const ADMIN = 'administracao@example.com';
const PASSWORD = 'Apresentacao2026';

/** Entra no mock e guarda a sessão, como o login faria. */
async function signIn(email: string) {
  const session = await TestBed.inject(BiosApi).login({ body: { email, password: PASSWORD } });

  TestBed.inject(InMemoryApiCredentials).setAccessToken(session.access_token);
  TestBed.inject(SessionStore).store(session);
}

/** Abre `/conta` com a conta carregada (USER começa com endereço; ADMIN, sem). */
async function renderAccount(email = USER) {
  const result = await render(AccountPage, {
    providers: [provideRouter([]), provideMockBiosApi({ latencyMs: 0 })],
  });
  await signIn(email);
  await screen.findByRole('heading', { name: 'Seus dados' });

  return { ...result, user: userEvent.setup() };
}

function saveButton(): HTMLButtonElement {
  return screen.getByRole('button', { name: 'Salvar' });
}

function savedData(): HTMLElement {
  return screen.getByRole('region', { name: 'Seus dados' });
}

describe('AccountPage', () => {
  it('mostra os dados da conta: nome, e-mail, papel e endereço com o CEP formatado', async () => {
    await renderAccount();

    const data = savedData();
    expect(data.textContent).toContain('Conta de Demonstração');
    expect(data.textContent).toContain(USER);
    expect(data.textContent).toContain('Usuário');
    expect(data.textContent).toContain('Avenida Paulista, 1578');
    expect(data.textContent).toContain('CEP 01310-200');
  });

  it('sem endereço, diz que não há e não oferece removê-lo', async () => {
    await renderAccount(ADMIN);

    expect(savedData().textContent).toContain('Nenhum endereço informado.');
    expect(savedData().textContent).toContain('Administrador');
    expect(screen.queryByRole('button', { name: 'Remover endereço' })).toBeNull();
  });

  it('"Salvar" só habilita quando algo mudou, e volta a desabilitar ao desfazer', async () => {
    const { user } = await renderAccount();
    const name = screen.getByLabelText('Nome');

    expect(saveButton().disabled).toBe(true);
    await user.type(name, 'x');
    expect(saveButton().disabled).toBe(false);
    await user.type(name, '{Backspace}');
    expect(saveButton().disabled).toBe(true);
  });

  it('salva só o nome, mostra o sucesso e passa a exibir o que a API devolveu', async () => {
    const { user } = await renderAccount();
    const update = vi.spyOn(TestBed.inject(BiosApi), 'updateOwnAccount');

    await user.clear(screen.getByLabelText('Nome'));
    await user.type(screen.getByLabelText('Nome'), '  Nome Novo  ');
    await user.click(saveButton());

    expect(update).toHaveBeenCalledWith({ body: { name: 'Nome Novo' } });
    expect(await screen.findByText('Dados salvos.')).toBeTruthy();
    await vi.waitFor(() => {
      expect(savedData().textContent).toContain('Nome Novo');
    });
    expect(saveButton().disabled).toBe(true);
  });

  it('a máscara do CEP põe o hífen; o endereço vai inteiro, com o CEP em dígitos', async () => {
    const { user } = await renderAccount();
    const update = vi.spyOn(TestBed.inject(BiosApi), 'updateOwnAccount');
    const cep = screen.getByLabelText<HTMLInputElement>('CEP');

    await user.clear(cep);
    await user.type(cep, '01.311-000');
    expect(cep.value).toBe('01311-000');
    await user.click(saveButton());

    expect(update).toHaveBeenCalledWith({
      body: {
        address: {
          postal_code: '01311000',
          street: 'Avenida Paulista',
          number: '1578',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
        },
      },
    });
    await vi.waitFor(() => {
      expect(savedData().textContent).toContain('CEP 01311-000');
    });
  });

  it('sem endereço, começar a preenchê-lo cobra os demais campos, com as mensagens da API', async () => {
    const { user, fixture } = await renderAccount(ADMIN);
    const update = vi.spyOn(TestBed.inject(BiosApi), 'updateOwnAccount');

    await user.type(screen.getByLabelText('Logradouro'), 'Rua Augusta');
    await user.click(saveButton());
    await fixture.whenStable();

    expect(update).not.toHaveBeenCalled();
    expect(screen.getByText('Informe um CEP válido (8 dígitos).')).toBeTruthy();
    expect(screen.getByText('Informe o número.')).toBeTruthy();
    expect(screen.getByText('Informe a sigla de uma unidade da federação.')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('CEP'));
  });

  it('sem endereço e com os campos em branco, só o nome é cobrado', async () => {
    const { user } = await renderAccount(ADMIN);
    const update = vi.spyOn(TestBed.inject(BiosApi), 'updateOwnAccount');

    await user.type(screen.getByLabelText('Nome'), ' Silva');
    await user.click(saveButton());

    expect(update).toHaveBeenCalledWith({
      body: { name: 'Administração de Demonstração Silva' },
    });
  });

  it('erro de validação da API marca o campo do `path`', async () => {
    const { user, fixture } = await renderAccount();
    vi.spyOn(TestBed.inject(BiosApi), 'updateOwnAccount').mockRejectedValueOnce(
      new ApiError(422, {
        statusCode: 422,
        code: 'VALIDATION_FAILED',
        message: 'Os dados enviados são inválidos.',
        details: [{ path: 'address.neighborhood', message: 'Mensagem da API para o bairro.' }],
        timestamp: '2026-11-02T12:00:00.000Z',
        path: '/accounts/me',
      }),
    );

    await user.type(screen.getByLabelText('Bairro'), ' Central');
    await user.click(saveButton());
    await fixture.whenStable();

    const neighborhood = screen.getByLabelText('Bairro');
    expect(await screen.findByText('Mensagem da API para o bairro.')).toBeTruthy();
    expect(neighborhood.getAttribute('aria-invalid')).toBe('true');
  });

  it('sem UF, o município fica desabilitado', async () => {
    await renderAccount(ADMIN);

    expect(screen.getByLabelText<HTMLInputElement>('Cidade').disabled).toBe(true);
  });

  it('endereço gravado sem código continua salvando sem escolher da lista', async () => {
    const { user } = await renderAccount();
    const update = vi.spyOn(TestBed.inject(BiosApi), 'updateOwnAccount');

    await user.type(screen.getByLabelText('Bairro'), ' Central');
    await user.click(saveButton());

    expect(update).toHaveBeenCalledWith({
      body: { address: expect.objectContaining({ city: 'São Paulo' }) as unknown },
    });
  });

  it('município digitado e não escolhido da lista não salva', async () => {
    const { user, fixture } = await renderAccount();
    const update = vi.spyOn(TestBed.inject(BiosApi), 'updateOwnAccount');

    await user.type(screen.getByLabelText('Cidade'), ' Velho');
    await user.click(saveButton());
    await fixture.whenStable();

    expect(update).not.toHaveBeenCalled();
    expect(screen.getByText('Escolha um município da lista.')).toBeTruthy();
  });

  it('escolhe o município da lista da UF e envia o código', async () => {
    const { user } = await renderAccount();
    const update = vi.spyOn(TestBed.inject(BiosApi), 'updateOwnAccount');
    const city = screen.getByLabelText('Cidade');

    await user.clear(city);
    await user.type(city, 'camp');
    await user.click(await screen.findByRole('option', { name: 'Campinas' }));
    await user.click(saveButton());

    expect(update).toHaveBeenCalledWith({
      body: {
        address: expect.objectContaining({
          city: 'Campinas',
          city_ibge_code: '3509502',
        }) as unknown,
      },
    });
  });

  it('"Remover endereço" pede confirmação e envia `address: null`', async () => {
    const { user } = await renderAccount();
    const update = vi.spyOn(TestBed.inject(BiosApi), 'updateOwnAccount');

    await user.click(screen.getByRole('button', { name: 'Remover endereço' }));
    const dialog = await screen.findByRole('alertdialog', { name: 'Remover o endereço?' });
    expect(update).not.toHaveBeenCalled();
    await user.click(within(dialog).getByRole('button', { name: 'Remover endereço' }));

    // O diálogo fecha antes de a chamada sair.
    await vi.waitFor(() => {
      expect(update).toHaveBeenCalledWith({ body: { address: null } });
    });
    expect(await screen.findByText('Endereço removido.')).toBeTruthy();
    await vi.waitFor(() => {
      expect(savedData().textContent).toContain('Nenhum endereço informado.');
    });
    expect(screen.getByLabelText<HTMLInputElement>('CEP').value).toBe('');
  });

  it('cancelar a remoção não envia nada; o nome digitado sobrevive à remoção', async () => {
    const { user } = await renderAccount();
    const update = vi.spyOn(TestBed.inject(BiosApi), 'updateOwnAccount');
    await user.type(screen.getByLabelText('Nome'), ' Editado');

    await user.click(screen.getByRole('button', { name: 'Remover endereço' }));
    await user.click(await screen.findByRole('button', { name: 'Cancelar' }));
    await vi.waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    expect(update).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Remover endereço' }));
    const dialog = await screen.findByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Remover endereço' }));

    expect(await screen.findByText('Endereço removido.')).toBeTruthy();
    expect(screen.getByLabelText<HTMLInputElement>('Nome').value).toBe(
      'Conta de Demonstração Editado',
    );
    expect(saveButton().disabled).toBe(false);
  });

  it('leva à troca de senha', async () => {
    await renderAccount();

    expect(screen.getByRole('link', { name: 'Alterar a senha' }).getAttribute('href')).toBe(
      '/conta/senha',
    );
  });

  describe('excluir a conta (#30)', () => {
    /**
     * Sem o user-event: o diálogo fecha logo depois da resposta da API, e os ouvintes de foco dele
     * dispariam a detecção de mudanças dentro de outra (NG0101), o que só acontece no teste.
     */
    async function openDeletion() {
      await render(AccountPage, {
        providers: [
          provideRouter([{ path: '**', component: AccountPage }]),
          provideMockBiosApi({ latencyMs: 0 }),
        ],
      });
      await signIn(USER);
      await screen.findByRole('heading', { name: 'Seus dados' });
      fireEvent.click(screen.getByRole('button', { name: 'Excluir conta' }));

      return within(await screen.findByRole('alertdialog', { name: 'Excluir a sua conta?' }));
    }

    it('confirmada com a senha, apaga a sessão local e volta à página inicial com o aviso', async () => {
      const dialog = await openDeletion();

      fireEvent.input(dialog.getByLabelText('Senha'), { target: { value: PASSWORD } });
      fireEvent.click(dialog.getByRole('button', { name: 'Excluir conta' }));

      await vi.waitFor(() => {
        expect(TestBed.inject(Router).url).toBe('/?conta=excluida');
      });
      expect(TestBed.inject(SessionStore).isAuthenticated()).toBe(false);
      // A conta não existe mais: entrar com ela é recusado.
      await expect(
        TestBed.inject(BiosApi).login({ body: { email: USER, password: PASSWORD } }),
      ).rejects.toMatchObject({ status: 401 });
    });

    it('cancelar mantém a conta e a sessão', async () => {
      const dialog = await openDeletion();

      fireEvent.click(dialog.getByRole('button', { name: 'Cancelar' }));

      await vi.waitFor(() => {
        expect(screen.queryByRole('alertdialog')).toBeNull();
      });
      expect(TestBed.inject(SessionStore).isAuthenticated()).toBe(true);
      expect(screen.getByRole('heading', { name: 'Seus dados' })).toBeTruthy();
    });
  });
});
