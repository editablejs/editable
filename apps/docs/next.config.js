const withPlugins = require('next-compose-plugins');
const withTM = require('next-transpile-modules')([
  '@editablejs/editor',
  '@editablejs/plugins',
  '@editablejs/plugin-yjs'
]);

const plugins = [
  [
    withTM,
    {
      reactStrictMode: false,
    },
  ],
];

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = withPlugins(plugins, {
  // swc 还未支持 babel-plugin-macros 插件
  // swcMinify: true,
  // removeConsole: true,
  // styledComponents: {
  //   displayName: true,
  //   ssr: true,
  // }
});

module.exports = nextConfig;
