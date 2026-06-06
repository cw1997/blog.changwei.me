import GithubSlugger from "github-slugger";
import type { ArticleHeading } from "@/lib/types";

const HEADING_LINE_REGEX = /^(#{1,6})\s+(.+)$/;

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

export function extractHeadings(markdown: string): ArticleHeading[] {
  const slugger = new GithubSlugger();
  const headings: ArticleHeading[] = [];
  let inCodeBlock = false;

  for (const line of markdown.split("\n")) {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) {
      continue;
    }

    const match = HEADING_LINE_REGEX.exec(trimmed);
    if (!match) {
      continue;
    }

    const level = match[1].length;
    if (level < 2) {
      continue;
    }

    const text = stripInlineMarkdown(match[2]);
    if (!text) {
      continue;
    }

    headings.push({
      id: slugger.slug(text),
      level,
      text,
    });
  }

  return headings;
}
