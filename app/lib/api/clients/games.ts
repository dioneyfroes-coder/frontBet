import { get, post } from '../rest';
import { z } from 'zod';

const remoteGameSchema = z
  .object({
    id: z.string(),
    slug: z.string().optional(),
    name: z.string().optional(),
    title: z.string().optional(),
    icon: z.string().optional(),
    category: z.string().optional(),
    overview: z.string().optional(),
    description: z.string().optional(),
    highlights: z.array(z.string()).optional(),
    enabled: z.boolean().optional(),
    status: z.string().optional(),
    minBet: z.number().optional(),
    maxBet: z.number().optional(),
    payoutMultiplier: z.number().optional(),
    fixedWinAmount: z.number().optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

const remoteGamesResponseSchema = z.union([
  z.array(remoteGameSchema),
  z.object({
    success: z.boolean().optional(),
    games: z.array(remoteGameSchema).optional(),
    data: z
      .union([
        z.array(remoteGameSchema),
        z.object({ games: z.array(remoteGameSchema).optional() }).passthrough(),
      ])
      .optional(),
  }),
]);

export type RemoteGameDescriptor = z.infer<typeof remoteGameSchema>;

export async function getGames() {
  const resp = await get<z.infer<typeof remoteGamesResponseSchema>>('/api/games', undefined, {
    validate: remoteGamesResponseSchema,
    skipAuth: true,
  });

  if (Array.isArray(resp)) {
    return resp;
  }

  if (Array.isArray(resp.games)) {
    return resp.games;
  }

  const data = resp.data;
  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === 'object' && Array.isArray((data as { games?: unknown[] }).games)) {
    return ((data as { games?: RemoteGameDescriptor[] }).games ?? []).filter(Boolean);
  }

  return [];
}

const choiceSchema = z.enum(['HEADS', 'TAILS'] as const);
const moneySchema = z.object({ amount: z.number(), currency: z.string().optional() }).partial();

const roundSchema = z.object({
  id: z.string().optional(),
  choice: choiceSchema,
  wager: z.number(),
  currency: z.string().optional(),
  result: z.enum(['WIN', 'LOSE', 'PENDING']).optional(),
  outcome: choiceSchema.optional(),
  payoutAmount: z.number().nullable().optional(),
  createdAt: z.string(),
});

const coinFlipConfigSchema = z.object({
  id: z.string().default('coin-flip'),
  name: z.string().optional(),
  enabled: z.boolean().default(true),
  minBet: z.number().nonnegative(),
  maxBet: z.number().nonnegative(),
  payoutMultiplier: z.number().optional(),
  fixedWinAmount: z.number().optional(),
  currency: z.string().optional().default('BRL'),
});

const historySchema = z.object({
  rounds: z.array(roundSchema).default([]),
  total: z.number().int().optional(),
});

const playSchema = z.object({
  round: roundSchema,
  wallet: z
    .object({
      balance: moneySchema.optional(),
      lockedBalance: moneySchema.optional(),
    })
    .partial()
    .optional(),
});

const feedSchema = z.object({
  rounds: z.array(roundSchema).default([]),
});

const envelope = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    success: z.boolean(),
    data: schema.optional().nullable(),
    meta: z.record(z.string(), z.any()).optional(),
  });

const coinFlipConfigResponse = envelope(coinFlipConfigSchema);
const historyResponse = envelope(historySchema);
const feedResponse = envelope(feedSchema);
const playResponse = envelope(playSchema);

export type CoinFlipConfig = z.infer<typeof coinFlipConfigSchema>;
export type CoinFlipRound = z.infer<typeof roundSchema>;
export type CoinFlipHistory = z.infer<typeof historySchema>;
export type CoinFlipPlayResponse = z.infer<typeof playSchema>;

export async function getCoinFlipConfig() {
  const res = await get<z.infer<typeof coinFlipConfigResponse>>('/api/games/coin-flip', undefined, {
    validate: coinFlipConfigResponse,
  });
  return res.data ?? null;
}

export async function getCoinFlipHistory(params?: Record<string, unknown>) {
  const res = await get<z.infer<typeof historyResponse>>('/api/games/coin-flip/history', params, {
    validate: historyResponse,
  });
  return res.data ?? { rounds: [] };
}

export async function getCoinFlipFeed(params?: Record<string, unknown>) {
  const res = await get<z.infer<typeof feedResponse>>('/api/games/coin-flip/feed', params, {
    validate: feedResponse,
  });
  return res.data ?? { rounds: [] };
}

export async function playCoinFlip(payload: { choice: 'HEADS' | 'TAILS'; wager: number }) {
  const res = await post<z.infer<typeof playResponse>>('/api/games/coin-flip/play', payload, {
    validate: playResponse,
  });
  return res.data ?? null;
}

export default {
  getGames,
  getCoinFlipConfig,
  getCoinFlipHistory,
  getCoinFlipFeed,
  playCoinFlip,
};
