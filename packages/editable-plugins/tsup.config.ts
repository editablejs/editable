import { defineConfig } from 'tsup'
import { lessLoader } from 'esbuild-plugin-less'

export default defineConfig({
  entry: ["src/index.ts"],
  inject: ["react-shim.ts"],
  format: ["cjs", "esm", "iife"],
  dts: true,
  sourcemap: true,
  esbuildPlugins: [lessLoader()],
  esbuildOptions(options) {
    options.bundle = true
    options.external = ["react", "react-dom", "slate", "@editablejs/editor"]
  },
})