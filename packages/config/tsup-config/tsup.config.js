const styled = require('esbuild-plugin-styled-components')

module.exports = options => {
  const isDev = !!options.watch
  return {
    bundle: true,
    target: ['es2020'],
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    esbuildPlugins: [
      styled({
        displayName: isDev,
        minify: !isDev,
      }),
    ],
    esbuildOptions(options) {
      options.external = ['react', 'react-dom', '@editablejs']
    },
  }
}
