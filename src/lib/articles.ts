import { unstable_cache } from "next/cache";
import {
  createExcerpt,
  extractFirstImageFromMarkdown,
  extractImagesFromMarkdown,
  extractTitleFromMarkdown,
  markdownToHtml,
  parseTrailingFrontmatter,
  resolveMarkdownAssetUrls,
  wrapImagesWithScrollContainer,
} from "@/lib/markdown";
import { getArticlesRootPath, getRawContentUrl, getRemoteMarkdown, getRepositoryTree } from "@/lib/github";
import type { Article } from "@/lib/types";

function normalizeCategory(category: string): string {
  return category.trim().toLowerCase();
}

function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

function formatFallbackTitle(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function pathToSlugSegments(markdownPath: string): string[] {
  const root = getArticlesRootPath();

  if (!markdownPath.startsWith(root) || !markdownPath.endsWith(".md")) {
    return [];
  }

  const withoutRoot = markdownPath.slice(root.length, -3);
  const segments = withoutRoot.split("/").filter(Boolean);

  if (segments.length >= 2 && segments[segments.length - 1] === segments[segments.length - 2]) {
    return segments.slice(0, -1);
  }

  return segments;
}

function toIsoDate(input?: string): string | undefined {
  if (!input) {
    return undefined;
  }

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString();
}

function categoryFromPath(slugSegments: string[]): string[] {
  if (slugSegments.length === 0) {
    return [];
  }

  return [slugSegments[0]];
}

function filterArticles(
  articles: Article[],
  options: {
    category?: string;
    tag?: string;
  },
): Article[] {
  const normalizedCategory = options.category ? normalizeCategory(options.category) : undefined;
  const normalizedTag = options.tag ? normalizeTag(options.tag) : undefined;

  return articles.filter((article) => {
    const categoryMatched = normalizedCategory
      ? article.categories.some((item) => normalizeCategory(item) === normalizedCategory)
      : true;

    const tagMatched = normalizedTag
      ? article.tags.some((item) => normalizeTag(item) === normalizedTag)
      : true;

    return categoryMatched && tagMatched;
  });
}

async function fetchAllArticlesUncached(): Promise<Article[]> {
  const tree = await getRepositoryTree();
  const markdownPaths = tree.tree
    .filter((item) => item.type === "blob")
    .map((item) => item.path)
    .filter((path) => path.startsWith(getArticlesRootPath()) && path.endsWith(".md"));

  const articles = await Promise.all(
    markdownPaths.map(async (markdownPath): Promise<Article | null> => {
      const slugSegments = pathToSlugSegments(markdownPath);

      if (slugSegments.length === 0) {
        return null;
      }

      const slug = slugSegments.join("/");
      const articleDir = markdownPath.slice(0, markdownPath.lastIndexOf("/"));
      const rawArticleDirUrl = getRawContentUrl(articleDir);
      const sourceMarkdown = await getRemoteMarkdown(markdownPath);
      const parsed = parseTrailingFrontmatter(sourceMarkdown);

      const normalizedMarkdown = resolveMarkdownAssetUrls(parsed.body, rawArticleDirUrl);
      const renderedHtml = await markdownToHtml(normalizedMarkdown);
      const htmlContent = wrapImagesWithScrollContainer(renderedHtml);
      const title = parsed.frontmatter.title ?? extractTitleFromMarkdown(parsed.body) ?? formatFallbackTitle(slugSegments.at(-1) ?? slug);

      const frontmatterCategories = Array.isArray(parsed.frontmatter.category)
        ? parsed.frontmatter.category
        : parsed.frontmatter.category
          ? [parsed.frontmatter.category]
          : [];

      const categories = (frontmatterCategories.length > 0 ? frontmatterCategories : categoryFromPath(slugSegments)).map((item) => item.trim());
      const tags = (Array.isArray(parsed.frontmatter.tag) ? parsed.frontmatter.tag : parsed.frontmatter.tag ? [parsed.frontmatter.tag] : []).map((item) => item.trim());
      const coverImage = parsed.frontmatter.cover_image
        ? new URL(parsed.frontmatter.cover_image, `${rawArticleDirUrl}/`).toString()
        : undefined;
      const contentImages = extractImagesFromMarkdown(normalizedMarkdown);
      const previewImage = coverImage ?? extractFirstImageFromMarkdown(normalizedMarkdown);
      const excerpt = createExcerpt(parsed.body);

      return {
        slug,
        slugSegments,
        sourcePath: markdownPath,
        title,
        excerpt,
        excerptSource: "first-paragraph",
        htmlContent,
        markdownContent: normalizedMarkdown,
        author: parsed.frontmatter.author,
        categories,
        tags,
        coverImage,
        previewImage,
        contentImages,
        publishedAt: toIsoDate(parsed.frontmatter.date),
      };
    }),
  );

  return articles
    .filter((article): article is Article => article !== null)
    .sort((a, b) => {
      const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;

      if (aDate !== bDate) {
        return bDate - aDate;
      }

      return a.slug.localeCompare(b.slug);
    });
}

const getAllArticlesCached = unstable_cache(fetchAllArticlesUncached, ["all-articles"], {
  tags: ["articles"],
});

export async function getAllArticles(): Promise<Article[]> {
  return getAllArticlesCached();
}

export async function getLatestArticles(limit = 6): Promise<Article[]> {
  const articles = await getAllArticles();
  return articles.slice(0, limit);
}

export async function getArticleBySlug(slugSegments: string[]): Promise<Article | undefined> {
  const slug = slugSegments.join("/");
  const articles = await getAllArticles();
  return articles.find((article) => article.slug === slug);
}

export async function getAllCategories(): Promise<string[]> {
  const articles = await getAllArticles();
  const categories = new Set<string>();

  for (const article of articles) {
    for (const category of article.categories) {
      categories.add(category);
    }
  }

  return [...categories].sort((a, b) => a.localeCompare(b));
}

export async function getArticlesByCategory(category: string): Promise<Article[]> {
  const articles = await getAllArticles();
  return filterArticles(articles, { category });
}

export async function getAllTags(): Promise<string[]> {
  const articles = await getAllArticles();
  const tags = new Set<string>();

  for (const article of articles) {
    for (const tag of article.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((a, b) => a.localeCompare(b));
}

export async function getArticlesByTag(tag: string): Promise<Article[]> {
  const articles = await getAllArticles();
  return filterArticles(articles, { tag });
}

export async function getArticlesByTagAndCategory(tag: string, category?: string): Promise<Article[]> {
  const articles = await getAllArticles();
  return filterArticles(articles, { tag, category });
}
