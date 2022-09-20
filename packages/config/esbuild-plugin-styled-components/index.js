const babel = require('@babel/core');
const styled = require('babel-plugin-styled-components').default
const macros = require('babel-plugin-macros')
const twin = require('babel-plugin-twin')
const build = require('esbuild');
const fs = require('node:fs');

module.exports = (config) => {
  return {
    name: "styled-components",
    setup({ onLoad }) {
      const root = process.cwd();
      onLoad({ filter: /\.[tj]sx$/ }, async (args) => {

        const contents = await fs.promises.readFile(args.path, "utf8");
        if (!contents.includes('twin.macro')) return

        let { code } = babel.transformSync(contents, {
          babelrc: false,
          configFile: false,
          ast: false,
          root,
          filename: args.path,
          parserOpts: {
            sourceType: "module",
            allowAwaitOutsideFunction: true
          },
          generatorOpts: {
            decoratorsBeforeExport: true
          },
          presets: ['@babel/preset-typescript'],
          plugins: [
            twin,
            macros,
            [styled, { ...config }]
          ],
          sourceMaps: true,
          inputSourceMap: false
        });
        return { contents: code , loader: 'jsx' };
      });
    }
  }
}
