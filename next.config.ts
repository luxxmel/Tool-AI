import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "*.ngrok-free.dev",
    "*.ngrok.io",
    "*.loca.lt",
    "*.nip.io",
    "192.168.1.165",
    "192.168.1.165:3000",
    "192.168.*",
    "10.*",
    "172.*",
    "127.0.0.1",
    "localhost",
    "0.0.0.0",
  ],
  async headers() {
    return [
      {
        // Cho phép CORS đầy đủ cho tất cả API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
