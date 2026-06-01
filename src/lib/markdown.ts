import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import type { ArticleFrontmatter } from "@/lib/types";

const LEADING_FRONTMATTER_BLOCK_REGEX = /^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/;
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

function stripMarkdownToPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s{0,3}(?:-|\*|\+)\s+/gm, "")
    .replace(/^\s{0,3}\d+\.\s+/gm, "")
    .replace(/[\*_~]/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function looksLikeFrontmatterLine(line: string): boolean {
  const trimmed = line.trim();
  return FRONTMATTER_LINE_REGEX.test(trimmed);
}

function extractFirstMeaningfulParagraph(markdown: string): string {
  const normalized = normalizeLineEndings(markdown).trim();

  if (!normalized) {
    return "";
  }

  const paragraphs = normalized
    .split(/\n\s*\n+/)
    .map((part) => part.trim())
    .filter(Boolean);

  for (const paragraph of paragraphs) {
    if (paragraph.startsWith("```")) {
      continue;
    }

    if (paragraph.startsWith("#")) {
      continue;
    }

    const lines = paragraph.split("\n").map((line) => line.trim()).filter(Boolean);
    if (lines.length > 0 && lines.every(looksLikeFrontmatterLine)) {
      continue;
    }

    const plain = stripMarkdownToPlainText(paragraph);
    if (plain) {
      return plain;
    }
  }

  return stripMarkdownToPlainText(normalized);
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
  let body = normalizeLineEndings(markdown).trimEnd();
  let frontmatter: ArticleFrontmatter = {};

  const leading = body.match(LEADING_FRONTMATTER_BLOCK_REGEX);
  if (leading && hasFrontmatterPairs(leading[1])) {
    body = body.slice(leading[0].length).trimStart();
    frontmatter = {
      ...frontmatter,
      ...parseFrontmatter(leading[1]),
    };
  }

  const trailing = body.match(FRONTMATTER_BLOCK_REGEX);
  if (trailing && typeof trailing.index === "number" && hasFrontmatterPairs(trailing[1])) {
    body = body.slice(0, trailing.index).trimEnd();
    frontmatter = {
      ...frontmatter,
      ...parseFrontmatter(trailing[1]),
    };
  }

  return {
    body: body.trim(),
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
  const plainText = extractFirstMeaningfulParagraph(markdown);

  if (!plainText) {
    return "";
  }

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return `${plainText.slice(0, maxLength).trimEnd()}...`;
}

export function extractFirstImageFromMarkdown(markdown: string): string | undefined {
  return extractImagesFromMarkdown(markdown, 1)[0];
}

export function extractImagesFromMarkdown(markdown: string, maxCount = 30): string[] {
  const regex = /!\[[^\]]*\]\(([^)]+)\)/g;
  const uniqueImages = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(markdown)) !== null) {
    const raw = match[1].trim().replace(/^<|>$/g, "");
    const path = raw.split(/\s+/)[0]?.replace(/^['\"]|['\"]$/g, "");

    if (!path || path.startsWith("data:")) {
      continue;
    }

    uniqueImages.add(path);

    if (uniqueImages.size >= maxCount) {
      break;
    }
  }

  return [...uniqueImages];
}

export function resolveMarkdownAssetUrls(markdown: string, rawArticleDirPath: string): string {
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

    const baseUrl = rawArticleDirPath.endsWith("/") ? rawArticleDirPath : `${rawArticleDirPath}/`;
    const absoluteUrl = new URL(path, `http://localhost${baseUrl}`);
    return `![${normalizedAlt}](${absoluteUrl.pathname}${absoluteUrl.search}${absoluteUrl.hash})`;
  });
}

export function wrapImagesWithScrollContainer(html: string): string {
  return html.replace(/<img\s+([^>]*?)\/?>(?!\s*<\/span>)/g, (_match, attributes: string) => {
    const hasAlt = /\balt\s*=/.test(attributes);
    const safeAttributes = hasAlt
      ? attributes
      : `${attributes} alt="${escapeHtmlAttribute("image")}"`;

    return `<span class="md-image-scroll" role="group" aria-label="文章图片（可横向滚动）"><img ${safeAttributes}></span>`;
  });
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const output = await remark().use(remarkGfm).use(remarkHtml).process(markdown);
  return output.toString();
}
