import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Al definir localPatterns, Next.js bloquea cualquier imagen local que no coincida
    // con alguna entrada. Por eso hace falta la entrada general además de la del logo.
    localPatterns: [
      // Todas las imágenes de /public sin parámetros de consulta.
      {
        pathname: "/**",
        search: "",
      },
      // Logo con parámetro de versión (?v=2, ?v=3…) para evitar la caché del navegador.
      // Sin "search", se acepta cualquier valor (la comparación es literal, no admite comodines).
      {
        pathname: "/iconpage.jpg",
      },
    ],
  },
};

export default nextConfig;
