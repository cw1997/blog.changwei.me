import type { Metadata } from "next";
import { getAllCategories, getAllTags, getLatestArticles } from "@/lib/articles";
import { createPageMetadata, getSiteUrl, siteName } from "@/lib/site";
import type { PageProps } from "@/types/page";
import { HomePage } from "./HomePage";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: siteName,
    description: "昌维的个人博客，阅读最新技术文章、分类与标签归档。",
    canonical: "/",
  }),
  title: { absolute: siteName },
};

export default async function HomePageServer(props: PageProps<"/">) {
  const [latestArticles, categories, tags] = await Promise.all([
    getLatestArticles(8),
    getAllCategories(),
    getAllTags(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: getSiteUrl(),
    description: "昌维的个人博客，阅读最新技术文章、分类与标签归档。",
  };

  return (
    <HomePage
      latestArticles={latestArticles}
      categories={categories}
      tags={tags}
      jsonLd={jsonLd}
    />
  );
}
