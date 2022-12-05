const path = require('path')
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')
const { redirects } = require('./src/redirects.json')

/**
 * @type {import('next').NextConfig}
 */
const baseConfig = {
  pageExtensions: ['jsx', 'js', 'ts', 'tsx', 'mdx', 'md'],
  reactStrictMode: true,
  experimental: {
    plugins: true,
    scrollRestoration: true,
    legacyBrowsers: false,
    browsersListForSwc: true,
  },
  env: {
    SANDPACK_BARE_COMPONENTS: process.env.SANDPACK_BARE_COMPONENTS,
  },
  async redirects() {
    return redirects
  },
}

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = (phase, { defaultConfig }) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      ...defaultConfig,
      ...baseConfig,
    }
  }

  return {
    ...defaultConfig,
    ...baseConfig,
    output: 'standalone',
    experimental: {
      ...baseConfig.experimental,
      outputFileTracingRoot: path.join(__dirname, '../../'),
    },
  }
}

module.exports = nextConfig
