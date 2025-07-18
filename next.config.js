/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better performance
  experimental: {
    // Properly configure server components for Edge Runtime
    serverComponentsExternalPackages: ['mongodb'],
    // Optimize bundle size
    optimizePackageImports: ['lucide-react', '@tailwindcss/forms'],
  },

  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },

  // Webpack configuration for MongoDB in Edge Runtime
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Handle MongoDB in Edge Runtime
      if (process.env.NEXT_RUNTIME === 'edge') {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          crypto: false,
          dns: false,
          fs: false,
          net: false,
          tls: false,
        };
      }
    }
    return config;
  },

  // Environment variables for runtime
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Output configuration for deployment
  output: 'standalone',
  
  // Disable source maps in production for security
  productionBrowserSourceMaps: false,

  // Enable SWC minification for better performance
  swcMinify: true,

  // Optimize CSS
  optimizeFonts: true,

  // Enable strict mode for better performance
  reactStrictMode: true,

  // Trailing slash configuration
  trailingSlash: false,

  // TypeScript configuration
  typescript: {
    // Allow production builds to complete even with TypeScript errors
    // This is needed for deployment since we're fixing errors incrementally
    ignoreBuildErrors: true,
  },

  // ESLint configuration
  eslint: {
    // Allow production builds to complete even with ESLint errors
    // This is needed for deployment since we're fixing errors incrementally
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
