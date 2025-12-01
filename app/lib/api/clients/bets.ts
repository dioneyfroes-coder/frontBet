import { get, post } from '../rest';
import { BetResponse, BetListResponse } from '../../schemas/generated-schemas';

type BetEnvelope = ReturnType<typeof BetResponse.parse>;
type BetListEnvelope = ReturnType<typeof BetListResponse.parse>;

export async function placeBet(body: {
  eventId: string;
  marketId?: string;
  oddId?: string;
  amount: number;
  type?: 'SINGLE' | 'MULTIPLE';
  currency?: 'BRL' | 'USD' | 'EUR';
}) {
  // validate shape at compile time via types; runtime validation is provided by `post` when schema is supplied
  const res = await post<BetEnvelope>('/api/bets', body, { validate: BetResponse });
  return res.data ?? null;
}

export async function cancelBet(betId: string) {
  const res = await post<BetEnvelope>('/api/bets/cancel', { betId }, { validate: BetResponse });
  return res.data ?? null;
}

export async function getBet(id: string) {
  const res = await get<BetEnvelope>(`/api/bets/${encodeURIComponent(id)}`, undefined, {
    validate: BetResponse,
  });
  return res.data ?? null;
}

export async function listBets(params?: Record<string, unknown>) {
  const res = await get<BetListEnvelope>('/api/bets', params, { validate: BetListResponse });
  return res.data?.bets ?? [];
}

export default { placeBet, cancelBet };
