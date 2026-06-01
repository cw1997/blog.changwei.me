import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "user-images.githubusercontent.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/blog",
        destination: "/articles",
        permanent: true,
      },
      {
        source: "/blog/:path*",
        destination: "/articles/:path*",
        permanent: true,
      },
      {
        source: "/category/:path*",
        destination: "/categories/:path*",
        permanent: true,
      },
      {
        source: "/tag",
        destination: "/tags",
        permanent: true,
      },
      {
        source: "/tag/:path*",
        destination: "/tags/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
