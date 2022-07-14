import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ["src/index.ts"],
  inject: ["react-shim.ts"],
  format: ["cjs", "esm", "iife"],
  dts: true,
  sourcemap: true,
  esbuildOptions(options) {
    options.external = ["react", "react-dom", "slate"]
  },
})