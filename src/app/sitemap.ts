import type { MetadataRoute } from "next";
import { getAllArticles, getAllCategories, getAllTags } from "@/lib/articles";
import { articlePath, categoryPath, getSiteUrl, tagPath } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categories, tags] = await Promise.all([
    getAllArticles(),
    getAllCategories(),
    getAllTags(),
  ]);

  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: getSiteUrl(),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${getSiteUrl()}/articles`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${getSiteUrl()}/tags`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${getSiteUrl()}${articlePath(article.slug)}`,
    lastModified: article.publishedAt ? new Date(article.publishedAt) : now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${getSiteUrl()}${categoryPath(category)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const tagPages: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${getSiteUrl()}${tagPath(tag)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...articlePages, ...categoryPages, ...tagPages];
}
