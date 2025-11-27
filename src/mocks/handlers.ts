import { rest } from 'msw';

export const handlers = [
  rest.get('http://localhost:3000/api/wallets/me', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          id: '11111111-1111-1111-1111-111111111111',
          userId: 'cadaeb28-c7f7-425b-91f7-73a27141ae49',
          balance: { amount: 1234.56, currency: 'BRL' },
          createdAt: new Date().toISOString(),
        },
      })
    );
  }),
  // fallback for /api/games
  rest.get('http://localhost:3000/api/games', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ success: true, data: [{ id: 'g1', name: 'Demo Game' }] })
    );
  }),
];
