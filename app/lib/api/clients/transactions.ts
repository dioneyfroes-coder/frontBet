import { get } from '../rest';
import { TransactionHistory } from '../../schemas/generated-schemas';

export async function getTransactions(params?: Record<string, unknown>) {
  const res = await get('/api/wallets/transactions', params, { validate: TransactionHistory });
  return res as unknown as { transactions?: unknown[]; total?: number };
}

export default { getTransactions };
