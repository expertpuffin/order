import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server for the Docker image (node server.js)
  output: "standalone",
  /* config options here */
};

export default nextConfig;
