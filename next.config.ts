import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Paquetes que solo se publican como ESM: así también los transforma Jest (next/jest)
  transpilePackages: [
    "@tanstack/react-table",
    "@tanstack/table-core",
    "@tanstack/react-store",
    "@tanstack/store",
    "react-medium-image-zoom",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "tailwindui.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "store.sony.com.co" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
