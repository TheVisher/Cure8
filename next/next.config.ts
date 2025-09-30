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
  // Refined Firefox compatibility fixes - less aggressive
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Essential fallbacks for Firefox
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
      
      // Minimal chunk optimization for Firefox
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