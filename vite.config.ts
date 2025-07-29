import { defineConfig } from 'vite';
import { vitePlugin as remix } from '@remix-run/dev';
import UnoCSS from 'unocss/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { optimizeCssModules } from 'vite-plugin-optimize-css-modules';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    UnoCSS(),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    nodePolyfills(),
    optimizeCssModules(),
    tsconfigPaths(),
    react(),
  ],
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
  optimizeDeps: {
    include: ['react-dom/server'],
  },
  ssr: {
    external: ['react-dom/server'],
  },
});
