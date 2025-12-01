import type { GameDescriptor, GameModuleImporter } from '../types/games';
import type { RemoteGameDescriptor } from '../lib/api/clients/games';
import { getGames } from '../lib/api/clients/games';

const loadLiveMatchMonitor: GameModuleImporter = () =>
  import('../games/live-match-monitor').then((module) => ({ default: module.LiveMatchMonitor }));

const loadOddsHeatmap: GameModuleImporter = () =>
  import('../games/odds-heatmap').then((module) => ({ default: module.OddsHeatmap }));

const loadPenaltyAnalytics: GameModuleImporter = () =>
  import('../games/penalty-analytics').then((module) => ({ default: module.PenaltyAnalytics }));

const loadCoinFlip: GameModuleImporter = () =>
  import('../games/coin-flip').then((module) => ({ default: module.CoinFlipGame }));

const moduleMap: Record<string, GameModuleImporter> = {
  'live-monitor': loadLiveMatchMonitor,
  'odds-heatmap': loadOddsHeatmap,
  'penalty-analytics': loadPenaltyAnalytics,
  'coin-flip': loadCoinFlip,
};

type MutableDescriptor = Omit<GameDescriptor, 'highlights'> & { highlights: string[] };

const DEFAULT_CATEGORY: GameDescriptor['category'] = 'monitoramento';
const CACHE_TTL_MS = 30_000;

let registryCache: GameDescriptor[] | null = null;
let cacheTimestamp = 0;
let inflight: Promise<GameDescriptor[]> | null = null;

function normalizeCategory(category?: string): GameDescriptor['category'] {
  if (!category) return DEFAULT_CATEGORY;
  const normalized = category.toLowerCase();
  if (normalized.includes('prob')) return 'probabilidades';
  if (normalized.includes('intel')) return 'inteligencia';
  return DEFAULT_CATEGORY;
}

function coerceHighlights(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);
}

function hydrateRemoteGame(remote: RemoteGameDescriptor): GameDescriptor | null {
  const slug = remote.slug ?? remote.id;
  if (!slug) return null;
  const loadComponent = moduleMap[slug];
  if (!loadComponent) return null;

  const descriptor: MutableDescriptor = {
    id: remote.id ?? slug,
    slug,
    name: remote.name ?? remote.title ?? slug,
    icon: remote.icon ?? '🎮',
    category: normalizeCategory(remote.category),
    overview: remote.overview ?? remote.description ?? '',
    highlights: [],
    loadComponent,
  };

  descriptor.highlights = coerceHighlights(remote.highlights);
  return descriptor;
}

async function fetchAndHydrate(): Promise<GameDescriptor[]> {
  const remote = await getGames();
  const hydrated = remote
    .map((item) => hydrateRemoteGame(item))
    .filter((item): item is GameDescriptor => Boolean(item));
  registryCache = hydrated;
  cacheTimestamp = Date.now();
  return hydrated;
}

export async function loadGameRegistry(options?: { force?: boolean }) {
  const now = Date.now();
  if (!options?.force && registryCache && now - cacheTimestamp < CACHE_TTL_MS) {
    return registryCache;
  }

  if (!inflight) {
    inflight = fetchAndHydrate().finally(() => {
      inflight = null;
    });
  }

  return inflight;
}

export async function getGameBySlug(slug?: string) {
  if (!slug) {
    return undefined;
  }
  const registry = await loadGameRegistry();
  return registry.find((game) => game.slug === slug || game.id === slug);
}

export function clearGameRegistryCache() {
  registryCache = null;
  cacheTimestamp = 0;
  inflight = null;
}
