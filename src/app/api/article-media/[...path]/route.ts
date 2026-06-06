import { readArticleAsset } from "@/lib/articles-fs";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

function contentTypeForPath(filePath: string): string {
  const extension = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();
  return MIME_TYPES[extension] ?? "application/octet-stream";
}

export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path: pathSegments } = await context.params;
  const relativePath = pathSegments.join("/");

  try {
    const data = await readArticleAsset(relativePath);

    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": contentTypeForPath(relativePath),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return new Response("Not Found", { status: 404 });
    }

    throw error;
  }
}
