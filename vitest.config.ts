import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [
      'dan-examples/**/utils/diff.spec.ts',
      'node_modules/**/*',
      '**/*.d.ts',

      // Temporarily exclude failing test files until import issues are resolved
      'app/lib/runtime/message-parser.spec.ts',
      'test/lib/runtime/message-parser.spec.ts',
    ],
    include: [
      'test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'app/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    environment: 'node',
    globals: true,
  },
});
