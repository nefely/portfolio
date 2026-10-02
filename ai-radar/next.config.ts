import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // a stray package-lock.json in a parent folder confuses workspace-root detection
  turbopack: { root: import.meta.dirname },
  // app/global-not-found.tsx: styled 404 for URLs outside /uk and /en
  experimental: { globalNotFound: true },
};

export default withNextIntl(nextConfig);
