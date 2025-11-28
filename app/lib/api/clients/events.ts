import { get } from '../rest';

export async function listEvents(params?: Record<string, unknown>) {
  const res = await get('/api/games', params); // backend exposes games/events at /api/games
  const maybe = res as unknown as { data?: unknown };
  return (maybe.data as unknown[] | null) ?? [];
}

export async function getEvent(id: string) {
  const res = await get(`/api/games/${encodeURIComponent(id)}`);
  const maybe = res as unknown as { data?: unknown };
  return maybe.data ?? null;
}

export default { listEvents, getEvent };
