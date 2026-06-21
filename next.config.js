/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    emotion: true,
  },
  // Pin the workspace root to this dir — without this, Turbopack picks the
  // parent (ag/) because of a stray package-lock.json, and module resolution
  // misses anything we install here (e.g. file: deps).
  turbopack: {
    root: __dirname,
  },
}

module.exports = nextConfig
