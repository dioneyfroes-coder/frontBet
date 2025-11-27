import { http } from 'msw';

export const handlers = [
  http.get('http://localhost:3000/api/wallets/me', async (info) => {
    const url = new URL(info.request.url);
    if (url.searchParams.get('error') === 'true') {
      return new Response(JSON.stringify({ success: false, error: { message: 'Simulated server error' } }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const body = JSON.stringify({
      success: true,
      data: {
        id: '11111111-1111-1111-1111-111111111111',
        userId: 'cadaeb28-c7f7-425b-91f7-73a27141ae49',
        balance: { amount: 1234.56, currency: 'BRL' },
        createdAt: new Date().toISOString(),
      },
    });
    return new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } });
  }),
  // fallback for /api/games
  http.get('http://localhost:3000/api/games', async () => {
    const body = JSON.stringify({ success: true, data: [{ id: 'g1', name: 'Demo Game' }] });
    return new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } });
  }),
  // Auth: register
  http.post('http://localhost:3000/api/auth/register', async ({ request }) => {
    const reqJson = await request.json().catch(() => ({}));
    const body = JSON.stringify({ success: true, data: { message: 'Registered', user: { id: 'u1', email: reqJson.email, username: reqJson.username } } });
    return new Response(body, { status: 201, headers: { 'Content-Type': 'application/json' } });
  }),
  // Auth: login
  http.post('http://localhost:3000/api/auth/login', async ({ request }) => {
    const reqJson = await request.json().catch(() => ({}));
    const body = JSON.stringify({ success: true, data: { accessToken: 'tok', refreshToken: 'ref', user: { id: 'u1', email: reqJson.email } } });
    return new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } });
  }),
  // Wallet transactions
  http.get('http://localhost:3000/api/wallets/transactions', async () => {
    const body = JSON.stringify({ transactions: [{ id: 't1', type: 'CREDIT', amount: 100, currency: 'BRL', createdAt: new Date().toISOString() }], total: 1 });
    return new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } });
  }),
  // Place a bet
  http.post('http://localhost:3000/api/bets', async ({ request }) => {
    const reqJson = await request.json().catch(() => ({}));
    const bet = { id: 'bet1', userId: 'u1', eventId: reqJson.eventId ?? 'e1', amount: reqJson.amount ?? 10, odds: 2.5, potentialReturn: (reqJson.amount ?? 10) * 2.5, status: 'PENDING', createdAt: new Date().toISOString() };
    return new Response(JSON.stringify(bet), { status: 201, headers: { 'Content-Type': 'application/json' } });
  }),
  // Cancel bet
  http.post('http://localhost:3000/api/bets/cancel', async ({ request }) => {
    const reqJson = await request.json().catch(() => ({}));
    const body = JSON.stringify({ success: true, data: { message: `Bet ${reqJson.betId} cancelled` } });
    return new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } });
  }),
];
