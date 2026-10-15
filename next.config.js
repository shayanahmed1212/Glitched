/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }], // R2 public URLs vary by bucket
  },
};
module.exports = nextConfig;
