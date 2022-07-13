const withPlugins = require('next-compose-plugins');
const withTM = require('next-transpile-modules')(['@editablejs/editor', '@editablejs/editor-plugins']);
const withLess = require('next-with-less');

const plugins = [
  [
    withLess,
    {
      lessLoaderOptions: {
        javascriptEnabled: true,
      },
    },
  ],
  [
    withTM,
    {
      reactStrictMode: false,
    },
  ],
]
module.exports = withPlugins(plugins);
