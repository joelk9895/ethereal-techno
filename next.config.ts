import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ethereal-techno-storage.s3.eu-west-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i1.sndcdn.com",
        port: "",
        pathname: "/**",
      }
    ],
  },
};

export default nextConfig;
