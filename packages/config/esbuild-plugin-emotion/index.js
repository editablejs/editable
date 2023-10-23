const babel = require('@babel/core')
const macros = require('babel-plugin-macros')
const twin = require('babel-plugin-twin')
const fs = require('node:fs')

module.exports = () => {
  return {
    name: 'emotion',
    setup({ onLoad }) {
      const root = process.cwd()
      onLoad({ filter: /\.[tj]s$/ }, async args => {
        const contents = await fs.promises.readFile(args.path, 'utf8')
        if (
          !contents.includes('twin.macro')
        )
          return

        let { code } = babel.transformSync(contents, {
          babelrc: false,
          configFile: false,
          ast: false,
          root,
          filename: args.path,
          parserOpts: {
            sourceType: 'module',
            allowAwaitOutsideFunction: true,
          },
          generatorOpts: {
            decoratorsBeforeExport: true,
          },
          presets: ['@babel/preset-typescript'],
          plugins: [twin, macros],
          sourceMaps: true,
          inputSourceMap: false,
        })
        return {
          contents: code,
          loader: 'js',
        }
      })
    },
  }
}
