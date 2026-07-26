/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The dev overlay and its compile pill sit inside anything that frames an
  // AG page, where they read as our chrome rather than as tooling.
  devIndicators: false,
  compiler: {
    emotion: true,
  },
  // Pin the workspace root to this dir — without this, Turbopack picks the
  // parent (ag/) because of a stray package-lock.json, and module resolution
  // misses anything we install here (e.g. file: deps).
  turbopack: {
    root: __dirname,
  },
  // Dev-only. Lets the dev server be reached through a subdomain
  // (ag.ptcx.is -> localhost:5000) so the protocodex ziggurat world can frame
  // an artifact page from a phone before this is deployed. No effect on a
  // production build.
  allowedDevOrigins: ['ag.ptcx.is'],
}

module.exports = nextConfig
