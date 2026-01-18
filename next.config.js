/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['mongoose', 'cloudinary'],
  outputFileTracingRoot: __dirname
};

module.exports = nextConfig;
