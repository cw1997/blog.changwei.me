import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { GitTreeItem, GitTreeResponse } from "@/lib/types";

// Allow overriding repository coordinates via environment variables for flexibility
const GITHUB_OWNER = process.env.GITHUB_OWNER ?? "cw1997";
const GITHUB_REPO = process.env.GITHUB_REPO ?? "blog";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH ?? "main";
const ARTICLES_ROOT = process.env.ARTICLES_ROOT ?? "articles/";
const ARTICLES_MIRROR_ROOT = process.env.ARTICLES_MIRROR_ROOT ?? "./tmp";

function getGitHubHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "blog.changwei.me",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function githubFetchJson<T>(url: string, tags: string[]): Promise<T> {
  const response = await fetch(url, {
    headers: getGitHubHeaders(),
    cache: "force-cache",
    next: { tags },
  });

  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

async function githubFetchText(url: string, tags: string[]): Promise<string> {
  const response = await fetch(url, {
    headers: getGitHubHeaders(),
    cache: "force-cache",
    next: { tags },
  });

  if (!response.ok) {
    throw new Error(`GitHub raw content request failed: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

export function getLocalContentUrl(assetPath: string): string {
  const relativePath = assetPath.startsWith(ARTICLES_ROOT)
    ? assetPath.slice(ARTICLES_ROOT.length)
    : assetPath;
  return `/article-assets/${relativePath}`;
}

export function getRawContentUrl(assetPath: string): string {
  const relativePath = assetPath.startsWith(ARTICLES_ROOT) ? assetPath.slice(ARTICLES_ROOT.length) : assetPath;

  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${relativePath
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}

export function getArticlesRootPath(): string {
  return ARTICLES_ROOT;
}

export async function getRepositoryTree(): Promise<GitTreeResponse> {
  async function collectTreeEntries(relativePath: string, entries: GitTreeItem[]): Promise<void> {
    const absolutePath = path.join(ARTICLES_MIRROR_ROOT, relativePath);
    const directoryEntries = await readdir(absolutePath, { withFileTypes: true });

    for (const entry of directoryEntries) {
      const childRelativePath = path.posix.join(relativePath.replace(/\\/g, "/"), entry.name);

      if (entry.isDirectory()) {
        entries.push({
          path: childRelativePath,
          mode: "040000",
          type: "tree",
          sha: `local-tree:${childRelativePath}`,
          url: `file://${path.join(ARTICLES_MIRROR_ROOT, childRelativePath)}`,
        });
        await collectTreeEntries(childRelativePath, entries);
        continue;
      }

      entries.push({
        path: childRelativePath,
        mode: "100644",
        type: "blob",
        sha: `local-blob:${childRelativePath}`,
        url: `file://${path.join(ARTICLES_MIRROR_ROOT, childRelativePath)}`,
      });
    }
  }

  const tree: GitTreeItem[] = [];

  try {
    await collectTreeEntries(ARTICLES_ROOT, tree);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { sha: "local-empty", truncated: false, tree: [] };
    }

    throw error;
  }

  return {
    sha: `local:${ARTICLES_MIRROR_ROOT}`,
    truncated: false,
    tree,
  };
}

export async function getRemoteMarkdown(markdownPath: string): Promise<string> {
  const localPath = path.join(ARTICLES_MIRROR_ROOT, markdownPath);
  return readFile(localPath, "utf8");
}
