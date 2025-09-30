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
  // Firefox compatibility fixes (won't affect Chrome)
  webpack: (config, { isServer, dev }) => {
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
      
      // Ensure proper module resolution for Firefox
      config.resolve.alias = {
        ...config.resolve.alias,
      };
      
      // Add Firefox-specific optimizations
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            // Ensure better chunk splitting for Firefox
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
    esmExternals: 'loose',
    // Enable better Firefox support
    optimizePackageImports: ['react', 'react-dom'],
  },
  // Compiler options for better Firefox support
  compiler: {
    removeConsole: false,
  },
  // Output configuration for better browser compatibility
  output: 'standalone',
  // Transpile packages for better Firefox compatibility
  transpilePackages: [],
};

export default nextConfig;