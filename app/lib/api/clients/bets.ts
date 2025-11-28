import { post } from '../rest';
import { BetResponse } from '../../schemas/generated-schemas';
import { get } from '../rest';
import { BetListResponse } from '../../schemas/generated-schemas';

export async function placeBet(body: {
  eventId: string;
  marketId?: string;
  oddId?: string;
  amount: number;
  type?: 'SINGLE' | 'MULTIPLE';
  currency?: 'BRL' | 'USD' | 'EUR';
}) {
  // validate shape at compile time via types; runtime validation is provided by `post` when schema is supplied
  const res = await post('/api/bets', body, { validate: BetResponse });
  return res as unknown as typeof res;
}

export async function cancelBet(betId: string) {
  const res = await post('/api/bets/cancel', { betId });
  return res;
}

export async function getBet(id: string) {
  const res = await get(`/api/bets/${encodeURIComponent(id)}`);
  return res as unknown as { data?: unknown };
}

export async function listBets(params?: Record<string, unknown>) {
  const res = await get('/api/bets', params, { validate: BetListResponse });
  return (res as unknown as { bets?: unknown[] }).bets ?? [];
}

export default { placeBet, cancelBet };
