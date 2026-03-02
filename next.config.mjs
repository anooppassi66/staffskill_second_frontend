/** @type {import('next').NextConfig} */
const nextConfig = {
  // when the app is deployed under a sub‑path (e.g. https://neurocruit.ai/lms)
  // we need to let Next know so that routing and asset paths are adjusted.
  basePath: '/lms',
  assetPrefix: '/lms/',

  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
