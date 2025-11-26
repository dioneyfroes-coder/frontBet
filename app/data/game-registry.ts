import type { GameDescriptor, GameModuleImporter } from '../types/games';

const loadLiveMatchMonitor: GameModuleImporter = () =>
  import('../games/live-match-monitor').then((module) => ({ default: module.LiveMatchMonitor }));

const loadOddsHeatmap: GameModuleImporter = () =>
  import('../games/odds-heatmap').then((module) => ({ default: module.OddsHeatmap }));

const loadPenaltyAnalytics: GameModuleImporter = () =>
  import('../games/penalty-analytics').then((module) => ({ default: module.PenaltyAnalytics }));

export const gameRegistry: GameDescriptor[] = [
  {
    id: 'live-monitor',
    slug: 'live-monitor',
    name: 'Live Match Monitor',
    icon: '📡',
    category: 'monitoramento',
    loadComponent: loadLiveMatchMonitor,
    overview:
      'Sincroniza eventos do jogo em tempo real com alertas de risco e alocação automática.',
    highlights: [
      'Análise de 120 métricas por partida',
      'Alertas preditivos em até 300ms',
      'Compatível com StreamDeck',
    ],
  },
  {
    id: 'odds-heatmap',
    slug: 'odds-heatmap',
    name: 'Odds Heatmap',
    icon: '🔥',
    category: 'probabilidades',
    loadComponent: loadOddsHeatmap,
    overview: 'Projeta volatilidade de odds com machine learning e aponta clusters mais quentes.',
    highlights: [
      'Feeds de 18 casas + exchanges',
      'Correlação automática com clima e localização',
      'Integração com alertas mobile',
    ],
  },
  {
    id: 'penalty-analytics',
    slug: 'penalty-analytics',
    name: 'Penalty Analytics',
    icon: '🥅',
    category: 'inteligencia',
    loadComponent: loadPenaltyAnalytics,
    overview: 'Simulador de pênaltis com histórico de batedores e tendências de goleiros.',
    highlights: [
      'Modelos por campeonato e temporada',
      'Learning loop baseado em scout humano',
      'Apresentação pronta para staff técnico',
    ],
  },
];

export function getGameBySlug(slug?: string) {
  if (!slug) {
    return undefined;
  }
  return gameRegistry.find((game) => game.slug === slug);
}
