const withPlugins = require('next-compose-plugins');
const withTM = require('next-transpile-modules')([
  '@editablejs/editor',
  '@editablejs/plugins'
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
  swcMinify: true,
});

module.exports = nextConfig;
