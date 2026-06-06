import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export const ARTICLES_DIR = path.resolve(/* turbopackIgnore: true */ process.cwd(), process.env.ARTICLES_DIR ?? "articles");

function resolveSafePath(relativePath: string): string {
  const normalized = relativePath.replace(/\\/g, "/");
  const absolutePath = path.resolve(ARTICLES_DIR, normalized);

  if (!absolutePath.startsWith(ARTICLES_DIR + path.sep) && absolutePath !== ARTICLES_DIR) {
    throw new Error(`Path traversal blocked: ${relativePath}`);
  }

  return absolutePath;
}

async function collectMarkdownFiles(relativeDir: string, results: string[]): Promise<void> {
  const absoluteDir = relativeDir ? resolveSafePath(relativeDir) : ARTICLES_DIR;

  let entries;
  try {
    entries = await readdir(absoluteDir, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return;
    }

    throw error;
  }

  for (const entry of entries) {
    const childRelative = relativeDir ? path.posix.join(relativeDir.replace(/\\/g, "/"), entry.name) : entry.name;

    if (entry.isDirectory()) {
      await collectMarkdownFiles(childRelative, results);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(childRelative);
    }
  }
}

export async function listMarkdownFiles(): Promise<string[]> {
  const results: string[] = [];
  await collectMarkdownFiles("", results);
  return results;
}

export async function readMarkdownFile(relativePath: string): Promise<string> {
  return readFile(resolveSafePath(relativePath), "utf8");
}

export async function readArticleAsset(relativePath: string): Promise<Buffer> {
  return readFile(resolveSafePath(relativePath));
}

export function getArticleAssetUrl(relativeDir: string): string {
  const normalized = relativeDir.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  return normalized ? `/articles/${normalized}` : "/articles";
}
