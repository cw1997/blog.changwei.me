import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const GITHUB_OWNER = process.env.GITHUB_OWNER ?? "cw1997";
const GITHUB_REPO = process.env.GITHUB_REPO ?? "blog";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH ?? "main";
const ARTICLES_ROOT = process.env.ARTICLES_ROOT ?? "articles/";
const MIRROR_ROOT = process.env.ARTICLES_MIRROR_ROOT ?? "./tmp/articles";
interface GitHubTreeItem {
  type: string;
  path: string;
}

function getGitHubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "blog.changwei.me",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  } else {
    console.warn("GITHUB_TOKEN is not set, falling back to the live GitHub API");
  }

  return headers;
}

async function fetchJson<T = unknown>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: getGitHubHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `GitHub API request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}

async function fetchBlob(url: string): Promise<Buffer> {
  const response = await fetch(url, {
    headers: getGitHubHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `GitHub raw content request failed: ${response.status} ${response.statusText}`,
    );
  }

  return Buffer.from(await response.arrayBuffer());
}

function toRemoteUrl(remotePath: string): string {
  const encodedPath = remotePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${encodedPath}`;
}

async function main(): Promise<void> {
  await rm(MIRROR_ROOT, { recursive: true, force: true });
  await mkdir(MIRROR_ROOT, { recursive: true });

  const treeUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/trees/${GITHUB_BRANCH}?recursive=1`;
  const tree = await fetchJson<{ tree: GitHubTreeItem[] }>(treeUrl);
  const files = tree.tree.filter(
    (item) => item.type === "blob" && item.path.startsWith(ARTICLES_ROOT),
  );

  for (const file of files) {
    const destination = path.join(MIRROR_ROOT, file.path);
    await mkdir(path.dirname(destination), { recursive: true });
    const content = await fetchBlob(toRemoteUrl(file.path));
    await writeFile(destination, content);
  }

  console.log(
    `Synced ${files.length} article files to ${MIRROR_ROOT} from GitHub`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
