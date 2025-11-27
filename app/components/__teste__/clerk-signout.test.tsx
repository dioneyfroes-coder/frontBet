import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, it, vi, afterEach, expect } from 'vitest';

import ClerkTokenRegistrar from '../clerk-token-registrar';
import * as authModule from '../../lib/auth';

// Create a mock Clerk where we can trigger signOut via stored callback
vi.mock('@clerk/react-router', () => {
  let storedCb: ((ev?: unknown) => void) | null = null;
  const mod = {
    useClerk: () => ({
      addListener: (cb: (ev?: unknown) => void) => {
        storedCb = cb;
      },
      removeListener: (_cb: (ev?: unknown) => void) => {
        storedCb = null;
      },
    }),
    // helper exposed by the mock for tests to trigger signOut
    _triggerSignOut: () => {
      if (storedCb) storedCb();
    },
  };
  return mod;
});

describe('Clerk signOut handling', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls logout handler when Clerk emits signOut', async () => {
    const spy = vi.spyOn(authModule, 'handleLogout').mockImplementation(() => Promise.resolve());

    // render registrar
    render(<ClerkTokenRegistrar />);

    // retrieve the mocked module to call _triggerSignOut
    const clerkMock = (await vi.importMock('@clerk/react-router')) as unknown;
    const maybe = (clerkMock as unknown as Record<string, unknown>)['_triggerSignOut'];
    if (typeof maybe === 'function') {
      (maybe as () => void)();
    }

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });
  });
});
