const DEFAULT_API_INTERNAL_URL = "http://localhost:3001";

function resolveApiInternalUrl() {
  const configuredUrl = process.env.API_INTERNAL_URL?.trim();
  const apiInternalUrl =
    configuredUrl && configuredUrl.length > 0
      ? configuredUrl
      : DEFAULT_API_INTERNAL_URL;

  return apiInternalUrl.replace(/\/+$/, "");
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const apiInternalUrl = resolveApiInternalUrl();

    return [
      {
        source: "/api/:path*",
        destination: `${apiInternalUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
