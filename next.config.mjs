/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Journal görselleri Sanity'nin CDN'inden geliyor. `next/image` uzak
    // kaynakları yalnızca burada izin verilirse optimize ediyor.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;
