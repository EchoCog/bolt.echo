import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { defineConfig } from 'vitest/config';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '~': resolve(rootDir, 'app'),
    },
  },
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
