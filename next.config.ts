import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.GITHUB_ACTIONS === "true" ? "/AI-Dictionary" : "",
  devIndicators: false,
  agentRules: false,
};

export default nextConfig;
