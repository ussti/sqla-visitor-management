import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security headers (additional to middleware)
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ];
  },

  // Enable image optimization for visitor photos
  images: {
    domains: [], // Add domains if loading external images
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // Environment variables validation
  env: {
    MONDAY_API_TOKEN: process.env.MONDAY_API_TOKEN,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    GOOGLE_CHAT_WEBHOOK_URL: process.env.GOOGLE_CHAT_WEBHOOK_URL,
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['react-i18next', 'react-hook-form'],
  },

  // Webpack optimization for production
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Production client-side optimizations
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 1,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
            },
          },
        },
      };
    }

    return config;
  },

  // Output standalone for Vercel deployment
  output: 'standalone',
};

export default nextConfig;
