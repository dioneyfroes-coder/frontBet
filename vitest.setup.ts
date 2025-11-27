import '@testing-library/jest-dom/vitest';
import { beforeAll, afterAll } from 'vitest';

// Simple centralized fetch mock for tests. MSW handlers exist in `src/mocks/` for future use,
// but for deterministic Node/jsdom tests we provide a light fetch replacement here.
let originalFetch: typeof globalThis.fetch | undefined;

beforeAll(() => {
	originalFetch = globalThis.fetch;
	// @ts-expect-error - assign fetch in test env
	globalThis.fetch = async (input: RequestInfo) => {
		const url = typeof input === 'string' ? input : (input as Request).url;
		if (url.includes('/api/wallets/me')) {
			const body = JSON.stringify({
				success: true,
				data: {
					id: '11111111-1111-1111-1111-111111111111',
					userId: 'cadaeb28-c7f7-425b-91f7-73a27141ae49',
					balance: { amount: 1234.56, currency: 'BRL' },
					createdAt: new Date().toISOString(),
				},
			});
			return new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } }) as unknown as Response;
		}
		if (url.includes('/api/games')) {
			const body = JSON.stringify({ success: true, data: [{ id: 'g1', name: 'Demo Game' }] });
			return new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } }) as unknown as Response;
		}
		if (originalFetch) return originalFetch(input as any);
		return new Response(null, { status: 404 }) as unknown as Response;
	};
});

afterAll(() => {
	if (originalFetch) {
		// @ts-expect-error - restore
		globalThis.fetch = originalFetch;
	}
});
