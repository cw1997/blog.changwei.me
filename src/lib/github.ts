import type { GitTreeResponse } from "@/lib/types";

// Allow overriding repository coordinates via environment variables for flexibility
const GITHUB_OWNER = process.env.GITHUB_OWNER ?? "cw1997";
const GITHUB_REPO = process.env.GITHUB_REPO ?? "blog";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH ?? "main";
const ARTICLES_ROOT = process.env.ARTICLES_ROOT ?? "articles/";

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

export function getRawContentUrl(path: string): string {
  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${encodedPath}`;
}

export function getArticlesRootPath(): string {
  return ARTICLES_ROOT;
}

export async function getRepositoryTree(): Promise<GitTreeResponse> {
  const treeUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/trees/${GITHUB_BRANCH}?recursive=1`;
  return githubFetchJson<GitTreeResponse>(treeUrl, ["articles", "github-tree"]);
}

export async function getRemoteMarkdown(path: string): Promise<string> {
  return githubFetchText(getRawContentUrl(path), ["articles", `article:${path}`]);
}
