/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/ui'],
  experimental: {
    reactCompiler: true,
    typedRoutes: true,
  },
  poweredByHeader: false,
};

export default nextConfig;
