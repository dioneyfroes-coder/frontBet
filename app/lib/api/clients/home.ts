import { get } from '../rest';

// Fetch homepage content from backend root `/`.
// Keep return type flexible since backend may return partial overrides.
export async function getHomeContent() {
  try {
    const res = await get('/', undefined, { skipAuth: true });
    return res as unknown;
  } catch {
    // bubble up or return null to allow graceful fallback
    return null;
  }
}

export default { getHomeContent };
