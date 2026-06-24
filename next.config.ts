import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer"],
  output: "export",
};

export default nextConfig;
