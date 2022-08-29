const fs = require('node:fs');
const path = require('node:path');
const { mergeConfig } = require('vite');
const lessToJS = require('less-vars-to-js');
const nodePolyfills = require('rollup-plugin-polyfill-node');
const viteNxProjectPaths =
  require('@nxext/vite/src/executors/utils/nx-project-paths').default;
const rootMain = require('../../../.storybook/main');

const themeVariables = lessToJS(
  fs.readFileSync(path.resolve(__dirname, '../config/variables.less'), 'utf8')
);

const workspaceRoot = path.resolve(__dirname, '../../../');

module.exports = {
  ...rootMain,
  features: {
    storyStoreV7: true,
  },
  core: {
    ...rootMain.core,
    builder: '@storybook/builder-vite',
  },
  stories: [
    ...rootMain.stories,
    '../**/*.stories.mdx',
    '../**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [...rootMain.addons],
  async viteFinal(config, { configType }) {
    if (configType === 'DEVELOPMENT') {
      // Your development configuration goes here
    }
    if (configType === 'PRODUCTION') {
      // Your production configuration goes here.
    }
    return mergeConfig(config, {
      // Your environment configuration here
      resolve: {
        ...config.resolve,
      },
      plugins: [nodePolyfills(), viteNxProjectPaths({ workspaceRoot })],
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
            modifyVars: themeVariables,
          },
        },
      },
    });
  },
};
