// Canonical barrel for `app/lib`.
// Re-export core API surface from the `api` subfolder (apiFetch, validation, rest helpers, schemas).
// Explicitly point to the folder `api/index` so we don't accidentally resolve the legacy `app/lib/api.ts` file.
export * from './api/index';
// `api/index` already re-exports `rest` and the generated schemas; avoid duplicate re-exports here.
export * from './api/clients/wallet';
export * from './api/clients/games';
export * from './api/clients/auth';
export * from './api/clients/bets';
export * from './api/clients/transactions';
export * from './api/clients/users';
export * from './api/clients/events';
export * from './api/clients/odds';
export * from './api/clients/markets';
export * from './api/clients/admin';
export * from './api/clients/reports';

export * from './token';
export * from './auth';
export * from './error';
export * from './cn';
export * from './api-client/types';

// Usage: `import { apiFetch, get, WalletResponse } from 'app/lib'`.
