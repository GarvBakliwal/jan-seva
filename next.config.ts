import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the development server to serve HMR resources to the phone on LAN.
  allowedDevOrigins: ['192.168.29.60'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xufjuyapdqfuezfzuwcb.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
