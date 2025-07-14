/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "**",
      },
      {
        hostname: "fakestoreapi.com",
      },
    ],
    dangerouslyAllowSVG: true,
    unoptimized: process.env.NODE_ENV === "development", // Disable optimization in development
  },
};

export default nextConfig;
