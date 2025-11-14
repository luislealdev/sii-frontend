import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración específica para Turbopack
  turbopack: {
    resolveAlias: {
      // Fuerza el uso correcto de PostCSS
    },
  },
};

export default nextConfig;
