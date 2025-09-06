import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['dan-examples/**/utils/diff.spec.ts'],
    environment: 'node',
    globals: true,
  },
});
