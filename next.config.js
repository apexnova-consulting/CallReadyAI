/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        buffer: false,
      }
    } else {
      // Server-side: exclude problematic pdfjs-dist from being bundled
      config.externals = config.externals || []
      if (Array.isArray(config.externals)) {
        config.externals.push({
          'pdfjs-dist': 'commonjs pdfjs-dist',
          'pdf-parse': 'commonjs pdf-parse'
        })
      }
    }
    return config
  },
}

// Only use Sentry if DSN is provided
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  const { withSentryConfig } = require('@sentry/nextjs')
  
  const sentryWebpackPluginOptions = {
    silent: true,
    org: "callready-ai",
    project: "callready-ai",
    hideSourceMaps: true,
  }

  module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions)
} else {
  module.exports = nextConfig
}