/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better performance
  experimental: {
    // Enable server components for better performance
    serverComponentsExternalPackages: ['mongodb', 'mongoose'],
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
            value: 'public, max-age=300, s-maxage=300',
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
    ];
  },

  // Redirects for SEO and user experience
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/dashboard/home',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },

  // Webpack optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      },
    };

    // Reduce bundle size by excluding server-only packages from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    // Optimize MongoDB for Edge Runtime
    config.externals = [...(config.externals || [])];
    if (isServer) {
      config.externals.push({
        'mongodb-client-encryption': 'commonjs mongodb-client-encryption',
        'aws4': 'commonjs aws4',
        'kerberos': 'commonjs kerberos',
        'snappy': 'commonjs snappy',
        'socks': 'commonjs socks',
        '@mongodb-js/zstd': 'commonjs @mongodb-js/zstd',
        '@aws-sdk/credential-providers': 'commonjs @aws-sdk/credential-providers',
      });
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
    // Dangerously allow production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;

