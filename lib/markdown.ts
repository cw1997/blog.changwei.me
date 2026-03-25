import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import type { ArticleFrontmatter } from "@/lib/types";

const FRONTMATTER_BLOCK_REGEX = /(?:\n|^)---\s*\n([\s\S]*?)\n---\s*$/;
const FRONTMATTER_LINE_REGEX = /^([A-Za-z_][\w-]*):\s*(.*)$/;

function normalizeLineEndings(content: string): string {
  return content.replace(/\r\n?/g, "\n");
}

function inferAltText(path: string): string {
  const lastSegment = path.split("/").filter(Boolean).at(-1) ?? "image";
  const decoded = decodeURIComponent(lastSegment)
    .replace(/\.[A-Za-z0-9]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim();

  return decoded || "image";
}

function hasFrontmatterPairs(content: string): boolean {
  return content.split("\n").some((line) => FRONTMATTER_LINE_REGEX.test(line.trim()));
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function parseArrayLikeValue(value: string): string[] {
  const trimmed = value.trim();

  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [trimmed];
}

function parseFrontmatter(content: string): ArticleFrontmatter {
  const lines = content.split(/\r?\n/);
  const map = new Map<string, string>();
  let currentKey: string | null = null;

  for (const line of lines) {
    const match = line.match(FRONTMATTER_LINE_REGEX);

    if (match) {
      currentKey = match[1];
      map.set(currentKey, match[2].trim());
      continue;
    }

    if (currentKey && line.trim()) {
      const previous = map.get(currentKey) ?? "";
      map.set(currentKey, `${previous} ${line.trim()}`.trim());
    }
  }

  const category = map.get("category");
  const tag = map.get("tag");

  return {
    title: map.get("title"),
    slug: map.get("slug"),
    date: map.get("date"),
    author: map.get("author"),
    cover_image: map.get("cover_image"),
    category: category ? parseArrayLikeValue(category) : undefined,
    tag: tag ? parseArrayLikeValue(tag) : undefined,
  };
}

export function parseTrailingFrontmatter(markdown: string): {
  body: string;
  frontmatter: ArticleFrontmatter;
} {
  const normalized = normalizeLineEndings(markdown).trimEnd();
  const match = normalized.match(FRONTMATTER_BLOCK_REGEX);

  if (!match || typeof match.index !== "number") {
    return {
      body: normalized.trim(),
      frontmatter: {},
    };
  }

  if (!hasFrontmatterPairs(match[1])) {
    return {
      body: normalized.trim(),
      frontmatter: {},
    };
  }

  const body = normalized.slice(0, match.index).trim();
  const frontmatter = parseFrontmatter(match[1]);

  return {
    body,
    frontmatter,
  };
}

export function extractTitleFromMarkdown(markdown: string): string | undefined {
  const heading = markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.startsWith("# "));

  return heading ? heading.replace(/^#\s+/, "").trim() : undefined;
}

export function createExcerpt(markdown: string, maxLength = 180): string {
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[[^\]]+\]\([^)]*\)/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/[>*_~\-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!plainText) {
    return "";
  }

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return `${plainText.slice(0, maxLength).trimEnd()}...`;
}

export function resolveMarkdownAssetUrls(markdown: string, rawArticleDirUrl: string): string {
  return markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, altText: string, rawPath: string) => {
    const path = rawPath.trim().replace(/^['\"]|['\"]$/g, "");
    const normalizedAlt = altText.trim() || inferAltText(path);

    if (
      !path ||
      path.startsWith("http://") ||
      path.startsWith("https://") ||
      path.startsWith("#") ||
      path.startsWith("data:")
    ) {
      return `![${normalizedAlt}](${path})`;
    }

    const absoluteUrl = new URL(path, `${rawArticleDirUrl}/`).toString();
    return `![${normalizedAlt}](${absoluteUrl})`;
  });
}

export function wrapImagesWithScrollContainer(html: string): string {
  return html.replace(/<img\s+([^>]*?)\/?>(?!\s*<\/span>)/g, (_match, attributes: string) => {
    const hasAlt = /\balt\s*=/.test(attributes);
    const safeAttributes = hasAlt
      ? attributes
      : `${attributes} alt="${escapeHtmlAttribute("image")}"`;

    return `<span class="md-image-scroll"><img ${safeAttributes}></span>`;
  });
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const output = await remark().use(remarkGfm).use(remarkHtml).process(markdown);
  return output.toString();
}
