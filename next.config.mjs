/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  distDir: './dist', // Changes the build output directory to `./dist/`.
  basePath: isProd ? '/ecommerce-supabase-next' : '',
  images: {
    remotePatterns: [
      {
        hostname: '**',
      },
      {
        hostname: 'fakestoreapi.com',
      },
    ],
    dangerouslyAllowSVG: true,
    unoptimized: process.env.NODE_ENV === 'development', // Disable optimization in development
  },
};

export default nextConfig;
