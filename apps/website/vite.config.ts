import { defineConfig } from 'vite';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [nodePolyfills({}) as any, react()],
  build: {
    target: 'es2017',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
});
