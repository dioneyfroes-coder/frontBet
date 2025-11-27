import { http } from 'msw';
import mockData from './data/mock-data.json';

// Toggle mocks via environment variables. For browser builds prefer `NEXT_PUBLIC_USE_MOCKS`.
// Always enable mocks during tests unless explicitly disabled.
const USE_MOCKS =
  (typeof process !== 'undefined' &&
    (process.env.NODE_ENV === 'test' ||
      process.env.NEXT_PUBLIC_USE_MOCKS === 'true' ||
      process.env.USE_MOCKS === 'true')) ||
  false;

const data = mockData as {
  wallet: Record<string, unknown>;
  games: Array<Record<string, unknown>>;
  transactions: Array<Record<string, unknown>>;
  bets: Array<Record<string, unknown>>;
};

function getSimulateOptions(info: { request: Request }) {
  const url = new URL(info.request.url);
  const delay = Number(url.searchParams.get('delay') || url.searchParams.get('sleep') || 0) || 0;
  const errorParam = url.searchParams.get('error') || undefined;
  const headerError = info.request.headers.get('x-simulate-error') || undefined;
  const error = headerError ?? errorParam;
  return { delay: Math.min(delay, 5000), error };
}

async function maybeDelay(ms: number) {
  if (!ms) return;
  await new Promise((r) => setTimeout(r, ms));
}

function matchPath(path: string) {
  return ({ request }: { request: Request }) => new URL(request.url).pathname === path;
}

export const handlers = USE_MOCKS
  ? [
      http.get(matchPath('/api/wallets/me'), async (info: { request: Request }) => {
        const { delay, error } = getSimulateOptions(info);
        await maybeDelay(delay);

        if (error === 'true' || error === 'server') {
          return new Response(
            JSON.stringify({ success: false, error: { message: 'Simulated server error' } }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
        if (error === 'unauthorized') {
          return new Response(
            JSON.stringify({ success: false, error: { message: 'Unauthorized' } }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const body = JSON.stringify({ success: true, data: data.wallet });
        return new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } });
      }),
      // fallback for /api/games
      http.get(matchPath('/api/games'), async () => {
        const body = JSON.stringify({ success: true, data: data.games });
        return new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } });
      }),
      // Auth: register
      http.post(matchPath('/api/auth/register'), async ({ request }: { request: Request }) => {
        const reqJson = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const email = typeof reqJson.email === 'string' ? reqJson.email : undefined;
        const username = typeof reqJson.username === 'string' ? reqJson.username : undefined;
        const body = JSON.stringify({
          success: true,
          data: { message: 'Registered', user: { id: 'u1', email, username } },
        });
        return new Response(body, { status: 201, headers: { 'Content-Type': 'application/json' } });
      }),
      // Auth: login
      http.post(matchPath('/api/auth/login'), async ({ request }: { request: Request }) => {
        const reqJson = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const email = typeof reqJson.email === 'string' ? reqJson.email : undefined;
        const body = JSON.stringify({
          success: true,
          data: { accessToken: 'tok', refreshToken: 'ref', user: { id: 'u1', email } },
        });
        return new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } });
      }),
      // Wallet transactions
      http.get(matchPath('/api/wallets/transactions'), async (info: { request: Request }) => {
        const { delay, error } = getSimulateOptions(info);
        await maybeDelay(delay);
        if (error === 'server')
          return new Response(JSON.stringify({ success: false }), { status: 500 });
        const body = JSON.stringify({
          transactions: data.transactions,
          total: data.transactions.length,
        });
        return new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } });
      }),
      // Place a bet
      http.post(matchPath('/api/bets'), async (info: { request: Request }) => {
        const { delay, error } = getSimulateOptions(info);
        await maybeDelay(delay);
        const reqJson = (await info.request.json().catch(() => ({}))) as Record<string, unknown>;
        const amount = typeof reqJson.amount === 'number' ? reqJson.amount : undefined;
        if (error === 'insufficient_funds' || (amount && amount > 10000)) {
          return new Response(
            JSON.stringify({
              success: false,
              error: { code: 'INSUFFICIENT_FUNDS', message: 'Not enough balance' },
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        if (error === 'server')
          return new Response(JSON.stringify({ success: false }), { status: 500 });
        const eventId = typeof reqJson.eventId === 'string' ? (reqJson.eventId as string) : 'e1';
        const betAmount = amount ?? 10;
        const bet = {
          id: 'bet1',
          userId: 'u1',
          eventId,
          amount: betAmount,
          odds: 2.5,
          potentialReturn: betAmount * 2.5,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        };
        data.bets.push(bet);
        return new Response(JSON.stringify(bet), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        });
      }),
      // Cancel bet
      http.post(matchPath('/api/bets/cancel'), async ({ request }: { request: Request }) => {
        const reqJson = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const betId = typeof reqJson.betId === 'string' ? reqJson.betId : 'unknown';
        const body = JSON.stringify({ success: true, data: { message: `Bet ${betId} cancelled` } });
        return new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } });
      }),
    ]
  : [];
