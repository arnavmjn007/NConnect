import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.auth0.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com', 
      },
      {
        protocol: 'https',
        hostname: '*.gravatar.com', 
      }
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
