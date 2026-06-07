import type { Metadata } from "next";

const LANGUAGE_LABELS: Record<string, string> = {
  "zh-CN": "中文",
  en: "EN",
  ja: "日本語",
  "zh-TW": "中文",
};

export function languageLabel(language?: string): string | undefined {
  return language ? LANGUAGE_LABELS[language] ?? language : undefined;
}

export const siteName = "昌维的博客";
export const siteDescription = "昌维的个人博客。";
export const defaultLocale = "zh_CN";

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:31006";
}

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, getSiteUrl()).toString();
}

export function articlePath(slug: string): string {
  return `/articles/${slug}`;
}

export function categoryPath(category: string): string {
  return `/categories/${encodeURIComponent(category)}`;
}

export function tagPath(tag: string, category?: string): string {
  if (!category) {
    return `/tags/${encodeURIComponent(tag)}`;
  }

  const query = new URLSearchParams({ category });
  return `/tags/${encodeURIComponent(tag)}?${query.toString()}`;
}

export function buildArticlesHref(category?: string, tag?: string): string {
  const query = new URLSearchParams();

  if (category) {
    query.set("category", category);
  }
  if (tag) {
    query.set("tag", tag);
  }

  const value = query.toString();
  return value ? `/articles?${value}` : "/articles";
}

type PageMetadataInput = {
  title: string;
  description: string;
  canonical: string;
  openGraphType?: "website" | "article";
  publishedTime?: string;
  images?: { url: string; alt?: string }[];
  keywords?: string[];
};

export function createPageMetadata({
  title,
  description,
  canonical,
  openGraphType = "website",
  publishedTime,
  images,
  keywords,
}: PageMetadataInput): Metadata {
  const ogImages = images?.map((image) => ({
    url: image.url.startsWith("http") ? image.url : absoluteUrl(image.url),
    alt: image.alt,
  }));

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: openGraphType,
      locale: defaultLocale,
      siteName,
      url: canonical,
      publishedTime,
      images: ogImages,
    },
    twitter: {
      card: ogImages?.length ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImages?.map((image) => image.url),
    },
  };
}
