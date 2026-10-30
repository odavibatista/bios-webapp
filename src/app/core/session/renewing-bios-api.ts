import { isApiError } from '../api/api-error';
import type { BiosApi } from '../api/bios-api';
import type { SessionService } from './session.service';
import type { SessionStore } from './session-store';

/**
 * O contrato com a renovação automática da sessão (UC17): uma operação que responde
 * `401 NOT_AUTHENTICATED` com uma sessão aberta renova o access token e é repetida uma vez, sem
 * a tela perceber. Vale para qualquer provedor (mockado ou HTTP), porque envolve o contrato.
 *
 * Se a sessão já foi renovada enquanto a chamada estava no ar (o token mudou), a chamada só é
 * repetida com o token novo: não há um segundo `refreshSession`.
 */
export function renewingBiosApi(
  implementation: BiosApi,
  store: SessionStore,
  session: SessionService,
): BiosApi {
  return new Proxy(implementation, {
    get(target, property, receiver) {
      const value: unknown = Reflect.get(target, property, receiver);

      if (typeof value !== 'function') return value;

      const operation = value as (...args: unknown[]) => Promise<unknown>;

      return async (...args: unknown[]) => {
        const tokenAtCall = store.accessToken();

        try {
          return await operation.apply(target, args);
        } catch (error) {
          if (!isApiError(error) || error.code !== 'NOT_AUTHENTICATED' || !tokenAtCall) {
            throw error;
          }

          const alreadyRenewed =
            store.accessToken() !== null && store.accessToken() !== tokenAtCall;

          if (!alreadyRenewed && !(await session.renew())) throw error;

          return operation.apply(target, args);
        }
      };
    },
  });
}
