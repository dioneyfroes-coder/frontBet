import { get } from '../rest';
import { MarketListResponse, Market } from '../../schemas/generated-schemas';
import type { z } from 'zod';

type MarketType = z.infer<typeof Market>;
type MarketListEnvelope = ReturnType<typeof MarketListResponse.parse>;

export async function listMarkets(params?: Record<string, unknown>) {
  const res = await get<MarketListEnvelope>('/api/markets', params, {
    validate: MarketListResponse,
  });
  return (res.data?.markets as MarketType[] | undefined) ?? [];
}

export async function getMarket(id: string) {
  const res = await get(`/api/markets/${encodeURIComponent(id)}`);
  const maybe = res as unknown as { data?: unknown };
  return maybe.data ?? null;
}

export default { listMarkets, getMarket };
