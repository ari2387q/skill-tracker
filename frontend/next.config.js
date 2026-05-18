/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    webpackMemoryOptimizations: true,
    webpackBuildWorker: false, // Compiles webpack inside the main thread to conserve memory
  }
}

module.exports = nextConfig
