import { get } from '../rest';

export async function getOdds(eventId: string) {
  const res = await get(`/api/games/${encodeURIComponent(eventId)}/odds`);
  const maybe = res as unknown as { data?: unknown };
  return (maybe.data as unknown[] | null) ?? [];
}

export default { getOdds };
