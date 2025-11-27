#!/usr/bin/env node
const fetch = globalThis.fetch;
if (!fetch) {
  console.error('Global fetch is not available. Run this script with Node 18+ or provide a fetch polyfill.');
  process.exit(2);
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backbet.onrender.com';

async function main() {
  const url = `${API_BASE.replace(/\/+$/, '')}/api/wallets/me`;
  console.log('Checking backend URL:', url);
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    console.log('Status:', res.status, res.statusText);
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      console.log('Body (json):', JSON.stringify(json, null, 2));
    } catch {
      console.log('Body (text):', text);
    }
  } catch (err) {
    console.error('Request failed:', err && err.message ? err.message : err);
    process.exit(2);
  }
}

main();
