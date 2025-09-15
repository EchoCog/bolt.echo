import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [
      'dan-examples/**/utils/diff.spec.ts',
      'node_modules/**/*',
      '**/*.d.ts'
    ],
    include: [
      'test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'app/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    environment: 'node',
    globals: true,
  },
});
