import { existsSync, readFileSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

// Load .env file if it exists (local dev), so Vercel doesn't need a committed .env
if (existsSync(".env")) {
  const envContent = readFileSync(".env", "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const GITHUB_OWNER = process.env.GITHUB_OWNER ?? "cw1997";
const GITHUB_REPO = process.env.GITHUB_REPO ?? "blog";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH ?? "main";
const ARTICLES_ROOT = process.env.ARTICLES_ROOT ?? "articles/";
const MIRROR_ROOT = process.env.ARTICLES_MIRROR_ROOT ?? "./tmp";
const PUBLIC_ASSETS_DIR = process.env.PUBLIC_ASSETS_DIR ?? "public/article-assets";
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".avif"]);
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
  await rm(PUBLIC_ASSETS_DIR, { recursive: true, force: true });

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

    const ext = path.extname(file.path).toLowerCase();
    if (IMAGE_EXTENSIONS.has(ext)) {
      const relativePath = file.path.startsWith(ARTICLES_ROOT)
        ? file.path.slice(ARTICLES_ROOT.length)
        : file.path;
      const publicDest = path.join(PUBLIC_ASSETS_DIR, relativePath);
      await mkdir(path.dirname(publicDest), { recursive: true });
      await writeFile(publicDest, content);
    }
  }

  console.log(
    `Synced ${files.length} article files to ${MIRROR_ROOT} from GitHub`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
