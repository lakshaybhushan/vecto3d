/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "2rvfpvdxbmcw4ua7.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
