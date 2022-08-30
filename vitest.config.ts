import react from '@vitejs/plugin-react';
import nxProjectPaths from '@nxext/vite/src/executors/utils/nx-project-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    react(),
    nxProjectPaths({
      workspaceRoot: __dirname,
    }),
  ],
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
  test: {
    globals: true,
  },
});
