import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest-setup.ts'],
    include: [
      'lib/**/*.{test,spec}.{ts,tsx}',
      'components/**/*.{test,spec}.{ts,tsx}',
      'scripts/**/*.{test,spec}.{ts,tsx}',
      'app/**/*.{test,spec}.{ts,tsx}',
      // Root-level tests (e.g. mdx-components.test.tsx — the @next/mdx registry
      // lives at the project root per App Router convention, so its test does too).
      '*.{test,spec}.{ts,tsx}',
    ],
    css: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
