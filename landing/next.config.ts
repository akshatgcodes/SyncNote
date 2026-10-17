import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Static HTML export, served at "/" by the Express server (server/index.js).
  output: "export",
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
