import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Compiler сам мемоізує компоненти, колбеки й обчислення — ручні
  // memo/useMemo лишаємо тільки там, де компілятор не допоможе (див. README).
  reactCompiler: true,
  images: {
    // Постери, банери й персонажі — CDN AniList, прев'ю трейлерів — YouTube.
    remotePatterns: [
      { protocol: "https", hostname: "s4.anilist.co" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
    // Постери не змінюються — довгий TTL оптимізованих картинок економить ресайзи.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
