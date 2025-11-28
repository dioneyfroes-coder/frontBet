import { get } from '../rest';
import { WalletResponse } from '../schemas/generated-schemas';

export async function getMyWallet() {
  const resp = await get<ReturnType<typeof WalletResponse.parse>>('/api/wallets/me', undefined, {
    validate: WalletResponse,
  });
  // resp matches WalletResponse; return the inner data (Wallet or undefined)
  return resp.data ?? null;
}

export default { getMyWallet };
