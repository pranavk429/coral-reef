import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/*": ["./coral/fixtures/**/*"],
  },
};

export default nextConfig;
