import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Compiler сам мемоізує компоненти, колбеки й обчислення — ручні
  // memo/useMemo лишаємо тільки там, де компілятор не допоможе.
  reactCompiler: true,
};

export default nextConfig;
