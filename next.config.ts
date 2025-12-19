import type { NextConfig } from "next";
import WithBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default WithBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(nextConfig);
