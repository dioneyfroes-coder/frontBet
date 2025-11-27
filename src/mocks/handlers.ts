import { http } from 'msw';

export const handlers = [
  http.get('http://localhost:3000/api/wallets/me', async (info) => {
    console.log('[msw] handler /api/wallets/me invoked');
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
];
