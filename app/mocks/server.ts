// Mocks removed: provide a no-op server object to keep tests/imports working.
export const server = {
	listen: (_opts?: unknown) => undefined,
	use: (..._handlers: unknown[]) => undefined,
	resetHandlers: () => undefined,
	close: () => undefined,
};

// Provide a minimal `http` helper with `get` / `post` wrappers so tests
// that import `http` don't fail at build time. These return simple
// placeholders that the no-op `server.use` will accept.
export const http = {
  get: (_matcher: unknown, _resolver: unknown) => undefined,
  post: (_matcher: unknown, _resolver: unknown) => undefined,
};
