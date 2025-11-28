/* eslint-disable @typescript-eslint/no-require-imports */

(async () => {
  process.env.NODE_ENV = 'test';
  // start msw server
  const { server } = require('../app/mocks/server');
  server.listen({ onUnhandledRequest: 'warn' });
  try {
    const res = await fetch('http://example.com/api/wallets/me');
    const text = await res.text();
    console.log('STATUS', res.status);
    console.log('BODY', text);
  } catch (err) {
    console.error('ERR', err);
  } finally {
    server.close();
  }
})();
