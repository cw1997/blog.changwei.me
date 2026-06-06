import { execSync } from "node:child_process";
import type { NextConfig } from "next";

function getGitInfo(): { sha: string; shaFull: string; date: string } {
  try {
    const shaFull = process.env.VERCEL_GIT_COMMIT_SHA ?? execSync("git rev-parse HEAD").toString().trim();
    const sha = shaFull.slice(0, 7);
    const date = execSync("git log -1 --format=%cI").toString().trim();

    return { sha, shaFull, date };
  } catch {
    return { sha: "dev", shaFull: "", date: "" };
  }
}

const gitInfo = getGitInfo();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_GIT_COMMIT_SHA: gitInfo.sha,
    NEXT_PUBLIC_GIT_COMMIT_SHA_FULL: gitInfo.shaFull,
    NEXT_PUBLIC_GIT_COMMIT_DATE: gitInfo.date,
  },
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
