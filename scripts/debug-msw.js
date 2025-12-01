// debug-msw: simple debug script for calling backend (no require-imports present)

(async () => {
  process.env.NODE_ENV = 'test';
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backbet.onrender.com';
  // Simple debug script that calls the real backend wallet endpoint.
  // Run with `USE_REAL_BACKEND=true` to avoid confusion.
  if (process.env.USE_REAL_BACKEND !== 'true') {
    // skip silently when not explicitly enabled
    return;
  }

  try {
    const res = await fetch(`${base}/api/wallets/me`);
    await res.text();
    // minimal output: status only
    console.log(res.status);
  } catch (err) {
    console.error(err && err.message ? err.message : err);
  }
})();
