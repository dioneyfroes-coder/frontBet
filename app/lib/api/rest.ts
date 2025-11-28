import type { ZodTypeAny } from 'zod';
import { apiFetch, validateWithSchema } from './index';

type RequestOpts = {
  validate?: ZodTypeAny;
  skipAuth?: boolean;
  timeoutMs?: number; // reserved for future extension
};

function serializeParams(params: Record<string, unknown>) {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v == null) continue;
    if (Array.isArray(v)) {
      for (const item of v) parts.push(`${encodeURIComponent(k)}[]=${encodeURIComponent(String(item))}`);
      continue;
    }
    if (typeof v === 'object') {
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(JSON.stringify(v))}`);
      continue;
    }
    parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  }
  return parts.join('&');
}

function buildUrl(path: string, params?: Record<string, unknown>) {
  if (!params || Object.keys(params).length === 0) return path;
  const q = serializeParams(params);
  return `${path}${path.includes('?') ? '&' : '?'}${q}`;
}

export async function get<T = unknown>(path: string, params?: Record<string, unknown>, opts: RequestOpts = {}): Promise<T> {
  const url = buildUrl(path, params);
  const res = await apiFetch(url, { method: 'GET', skipAuth: opts.skipAuth });
  if (opts.validate) return validateWithSchema(opts.validate, res as unknown) as T;
  return res as T;
}

export async function post<T = unknown>(path: string, body?: unknown, opts: RequestOpts = {}): Promise<T> {
  const res = await apiFetch(path, { method: 'POST', json: body, skipAuth: opts.skipAuth });
  if (opts.validate) return validateWithSchema(opts.validate, res as unknown) as T;
  return res as T;
}

export async function put<T = unknown>(path: string, body?: unknown, opts: RequestOpts = {}): Promise<T> {
  const res = await apiFetch(path, { method: 'PUT', json: body, skipAuth: opts.skipAuth });
  if (opts.validate) return validateWithSchema(opts.validate, res as unknown) as T;
  return res as T;
}

export async function del<T = unknown>(path: string, opts: RequestOpts = {}): Promise<T> {
  const res = await apiFetch(path, { method: 'DELETE', skipAuth: opts.skipAuth });
  if (opts.validate) return validateWithSchema(opts.validate, res as unknown) as T;
  return res as T;
}

export default {
  get,
  post,
  put,
  del,
};
