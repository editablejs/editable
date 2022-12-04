import withPlugins from 'next-compose-plugins'
import transpileModules from 'next-transpile-modules'
import redirects from './src/redirects.json' assert { type: 'json' }

const withTM = transpileModules([])

const plugins = [
  [
    withTM,
    {
      reactStrictMode: false,
    },
  ],
]

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = withPlugins(plugins, {
  pageExtensions: ['jsx', 'js', 'ts', 'tsx', 'mdx', 'md'],
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
    return redirects.redirects
  },
})

export default nextConfig
