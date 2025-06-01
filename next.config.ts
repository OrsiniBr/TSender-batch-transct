import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  distDir: 'out',
  images: {
    unoptimized: true, // Disable image optimization for static export

  }, 
  basePath: "",
  assetPrefix: './',
  trailingSlash: true, // Add trailing slashes to URLs
};

export default nextConfig;
