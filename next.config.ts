/** @type {import('next').NextConfig} */
import i18nConfig from "./next-i18next.config.js";

const nextConfig = {
  /* config options here */
  i18n: i18nConfig.i18n,
  images: {
    domains: ["sgp1.digitaloceanspaces.com", "localhost"],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
