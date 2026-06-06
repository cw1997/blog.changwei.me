import { unstable_cache } from "next/cache";
import { getArticleAssetUrl, listMarkdownFiles, readMarkdownFile } from "@/lib/articles-fs";
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
  if (!markdownPath.endsWith(".md")) {
    return [];
  }

  const withoutExtension = markdownPath.slice(0, -3);
  const segments = withoutExtension.split("/").filter(Boolean);

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

function resolveArticleAssetUrl(assetPath: string, articleDirPath: string): string {
  const pathValue = assetPath.trim();

  if (
    !pathValue ||
    pathValue.startsWith("http://") ||
    pathValue.startsWith("https://") ||
    pathValue.startsWith("#") ||
    pathValue.startsWith("data:")
  ) {
    return pathValue;
  }

  const baseUrl = articleDirPath.endsWith("/") ? articleDirPath : `${articleDirPath}/`;
  const absoluteUrl = new URL(pathValue, `http://localhost${baseUrl}`);
  return `${absoluteUrl.pathname}${absoluteUrl.search}${absoluteUrl.hash}`;
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
  const markdownPaths = await listMarkdownFiles();

  const articles = await Promise.all(
    markdownPaths.map(async (markdownPath): Promise<Article | null> => {
      const slugSegments = pathToSlugSegments(markdownPath);

      if (slugSegments.length === 0) {
        return null;
      }

      const slug = slugSegments.join("/");
      const articleDir = markdownPath.slice(0, markdownPath.lastIndexOf("/"));
      const rawArticleDirUrl = getArticleAssetUrl(articleDir);
      const sourceMarkdown = await readMarkdownFile(markdownPath);
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
      const coverImage = parsed.frontmatter.cover_image ? resolveArticleAssetUrl(parsed.frontmatter.cover_image, rawArticleDirUrl) : undefined;
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
        language: parsed.frontmatter.language,
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
