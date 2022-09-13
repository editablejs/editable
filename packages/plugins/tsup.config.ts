import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
  ],
  inject: ['react-shim.ts'],
  format: ['cjs', 'esm', 'iife'],
  bundle: true,
  dts: true,
  sourcemap: true,
  clean: true,
  esbuildOptions(options) {
    options.external = ['react', 'react-dom', '@editablejs/editor'];
  },
});
