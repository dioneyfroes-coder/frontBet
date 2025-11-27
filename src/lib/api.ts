import { z } from 'zod';

// Default API base points to the deployed backend. Use `NEXT_PUBLIC_API_BASE_URL` in env for browser builds.
// Keep older env names as fallback for compatibility: `PUBLIC_BACKEND_API_BASE_URL` and `URL_BACKEND`.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.PUBLIC_BACKEND_API_BASE_URL ?? process.env.URL_BACKEND ?? 'https://backbet.onrender.com';
// Optional request timeout (ms). If 0 or unset, no timeout is applied.
const API_TIMEOUT_MS = Number(process.env.API_TIMEOUT_MS ?? '0');

export type RequestOptions = Omit<RequestInit, 'body'> & {
  json?: unknown;
  validate?: z.ZodTypeAny;
};

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status = 500, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function apiFetch<T = unknown>(path: string, opts: RequestOptions = {}, signal?: AbortSignal): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(opts.headers as Record<string, string> | undefined),
  };

  let body: BodyInit | undefined;
  if (opts.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.json);
  }

  // If caller didn't provide a signal and a timeout is configured, use an AbortController to implement timeout
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let controller: AbortController | undefined;
  const finalSignal: AbortSignal | undefined = (() => {
    if (signal) return signal;
    if (API_TIMEOUT_MS > 0) {
      controller = new AbortController();
      timeoutId = setTimeout(() => controller?.abort(), API_TIMEOUT_MS);
      return controller.signal;
    }
    return undefined;
  })();

  try {
    const res = await fetch(url, {
      method: opts.method ?? 'GET',
      headers,
      body,
      signal: finalSignal,
    });

    const text = await res.text();
    const contentType = res.headers.get('content-type') ?? '';

    if (!res.ok) {
      let parsed: unknown = text;
      if (contentType.includes('application/json') && text) {
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = undefined;
        }
      }
      throw new ApiError(`HTTP ${res.status}`, res.status, parsed);
    }

    if (!text) return undefined as unknown as T;

    let data: unknown = text;
    if (contentType.includes('application/json')) {
      try {
        data = JSON.parse(text);
      } catch {
        throw new ApiError('Invalid JSON response', 502);
      }
    }

    // If caller provided a Zod schema, validate
    const schema = opts.validate;
    if (schema) {
      const result = schema.safeParse(data);
      if (!result.success) {
        throw new ApiError('Response validation failed', 502, result.error.format());
      }
      return result.data as T;
    }

    return data as T;
  } catch (err: unknown) {
    const e = err as { name?: string };
    if (e?.name === 'AbortError') {
      throw new ApiError('Request timed out', 408);
    }
    // rethrow unknown errors (preserve original when possible)
    if (err instanceof ApiError) throw err;
    if (err instanceof Error) throw err;
    throw new ApiError(String(err ?? 'Unknown error'), 500);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export function validateWithSchema<T>(schema: z.ZodSchema<T>, payload: unknown): T {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError('Request validation failed', 400, parsed.error.format());
  }
  return parsed.data;
}
