import { describe, it, expect } from 'vitest';
import { gameRegistry, getGameBySlug } from '../game-registry';

describe('gameRegistry', () => {
  it('exposes descriptors with required fields', () => {
    expect(gameRegistry.length).toBeGreaterThanOrEqual(3);
    for (const descriptor of gameRegistry) {
      expect(descriptor.id).toMatch(/^[a-z-]+$/);
      expect(descriptor.slug).toEqual(descriptor.id);
      expect(descriptor.name.length).toBeGreaterThan(0);
      expect(typeof descriptor.loadComponent).toBe('function');
      expect(Array.isArray(descriptor.highlights)).toBe(true);
    }
  });

  it('resolves a game by slug', () => {
    const sample = gameRegistry[0];
    const found = getGameBySlug(sample.slug);
    expect(found).toBe(sample);
    expect(getGameBySlug('inexistente')).toBeUndefined();
  });
});
