/* eslint-disable @typescript-eslint/no-require-imports */

/* eslint-disable @typescript-eslint/no-require-imports */

(async () => {
  process.env.NODE_ENV = 'test';
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backbet.onrender.com';
  // Simple debug script that calls the real backend wallet endpoint.
  // Run with `USE_REAL_BACKEND=true` to avoid confusion.
  if (process.env.USE_REAL_BACKEND !== 'true') {
    console.log(
      'Skipping debug fetch. Set USE_REAL_BACKEND=true to run this script against the real backend.'
    );
    return;
  }

  try {
    const res = await fetch(`${base}/api/wallets/me`);
    const text = await res.text();
    console.log('STATUS', res.status);
    console.log('BODY', text);
  } catch (err) {
    console.error('ERR', err);
  }
})();
