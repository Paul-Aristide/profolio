import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Permet au serveur de développement d'être accessible depuis le réseau local
    // Nécessaire pour accéder depuis http://192.168.100.45:3000
  },
  // Pour la production, configurez l'host ici
  // En développement, utilisez: npm run dev -- --hostname 0.0.0.0
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_DOMAIN || 'https://profolio.onrender.com',
          },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,PATCH,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
