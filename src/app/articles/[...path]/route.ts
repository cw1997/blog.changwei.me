import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const ARTICLES_MIRROR_ROOT = process.env.ARTICLES_MIRROR_ROOT ?? "/tmp/articles";

const CONTENT_TYPES: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function getContentType(filePath: string): string {
  return CONTENT_TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path: segments = [] } = await context.params;
  const relativePath = segments.filter(Boolean).join("/");

  if (!relativePath) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const resolvedRoot = path.resolve(ARTICLES_MIRROR_ROOT);
  const resolvedPath = path.resolve(path.join(resolvedRoot, relativePath));

  if (!resolvedPath.startsWith(`${resolvedRoot}${path.sep}`) && resolvedPath !== resolvedRoot) {
    return new NextResponse("Not Found", { status: 404 });
  }

  try {
    const body = await readFile(resolvedPath);
    return new NextResponse(body, {
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=3600",
        "Content-Type": getContentType(resolvedPath),
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}