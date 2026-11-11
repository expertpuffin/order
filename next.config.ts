import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server for the Docker image (node server.js)
  output: "standalone",
  // Old addresses still linked from emails and bookmarks; the query string is passed on
  async redirects() {
    return [
      { source: "/login", destination: "/?auth=login", permanent: false },
      { source: "/register", destination: "/?auth=register", permanent: false },
      { source: "/catalog", destination: "/", permanent: false },
      { source: "/dashboard", destination: "/orders", permanent: false },
    ];
  },
};

export default nextConfig;
