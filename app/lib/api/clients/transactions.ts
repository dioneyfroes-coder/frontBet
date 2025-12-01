import { get } from '../rest';
import { TransactionHistory } from '../../schemas/generated-schemas';

type TransactionHistoryEnvelope = ReturnType<typeof TransactionHistory.parse>;

export async function getTransactions(params?: Record<string, unknown>) {
  const res = await get<TransactionHistoryEnvelope>('/api/wallets/history', params, {
    validate: TransactionHistory,
  });
  return res.data ?? { transactions: [], total: 0 };
}

export default { getTransactions };
