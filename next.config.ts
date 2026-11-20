import path from "node:path";
import type { NextConfig } from "next";

const pagesBuild = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // raiz explícita: evita que lockfiles em pastas superiores confundam o Turbopack
  turbopack: { root: path.join(__dirname) },
  poweredByHeader: false,
  reactStrictMode: true,
  pageExtensions: pagesBuild ? ["tsx", "ts", "jsx", "js"] : ["server.ts", "tsx", "ts", "jsx", "js"],
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: pagesBuild,
  },
  ...(pagesBuild
    ? { output: "export", basePath: process.env.NEXT_PUBLIC_BASE_PATH, trailingSlash: true }
    : {
        async headers() {
          return [{ source: "/:path*", headers: securityHeaders }];
        },
      }),
};

export default nextConfig;
