import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type PluginOption } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const plugins: PluginOption[] = [tailwindcss(), tsconfigPaths()];
  if (mode !== 'test') {
    plugins.push(reactRouter());
  }

  return {
    plugins,
    define: {
      'process.env.CLERK_PUBLISHABLE_KEY': JSON.stringify(process.env.CLERK_PUBLISHABLE_KEY || ''),
    },
    server: {
      watch: {
        // react-router writes generated types into `.react-router/types` which
        // previously caused Vite to see file changes and trigger reload loops.
        ignored: ['**/.react-router/**'],
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: './vitest.setup.ts',
      exclude: [...configDefaults.exclude, 'e2e/**'],
    },
  };
});
