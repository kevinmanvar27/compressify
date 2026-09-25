/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow large video uploads via API routes (500MB)
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
    },
  },

  // fluent-ffmpeg uses native Node.js modules — tell Next.js not to bundle them
  serverExternalPackages: ["fluent-ffmpeg"],

  // CORS headers for the /api/compress endpoint
  // So Laravel (gujjugarba.com) can POST videos to compress.rektech.work
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin",  value: "*" },
          { key: "Access-Control-Allow-Methods", value: "POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
