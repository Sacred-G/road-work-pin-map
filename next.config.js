/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
        port: '',
        pathname: '/**',
      },
      // Add other patterns as needed
    ],
  },
  webpack: (config, { isServer }) => {
    // Ignore 'fs' module for client-side
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
      };
    }

    // Add rule to handle modules with `.mjs` and `.js` extensions properly
    config.module.rules.push({
      test: /\.m?js/,
      resolve: {
        fullySpecified: false, // Allows importing modules without specifying the file extension
      },
    });

    return config;
  },
};

module.exports = nextConfig;