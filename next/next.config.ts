const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  // Simplified Firefox compatibility fixes
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fix for Firefox webpack module loading issues
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        process: false,
      };
      
      // Better chunk splitting for Firefox
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            default: {
              minChunks: 1,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    
    return config;
  },
  // Experimental features for better browser compatibility
  experimental: {
    optimizePackageImports: ['react', 'react-dom'],
  },
  // Compiler options for better Firefox support
  compiler: {
    removeConsole: false,
  },
  // Output configuration for better browser compatibility
  output: 'standalone',
};

export default nextConfig;