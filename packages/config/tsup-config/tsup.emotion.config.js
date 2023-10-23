const emotion = require('esbuild-plugin-emotion')

module.exports = (options) => {
  return {
    bundle: true,
    target: ['es2020'],
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    esbuildPlugins: [
      emotion(),
    ],
    esbuildOptions(options) {
      options.external = ['@editablejs']
    },
  }
}
