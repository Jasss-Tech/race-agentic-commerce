/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@race/types',
    '@race/proof-engine',
    '@race/policy-engine',
    '@race/agent-core'
  ]
};

module.exports = nextConfig;
