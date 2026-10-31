// The website is built by Next.js into plain files (out/), which tools/build-worker.mjs
// packs into the Cloudflare Worker. Nothing runs on a Next.js server.
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
};
export default nextConfig;
