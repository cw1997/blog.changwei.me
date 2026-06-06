import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticlesByTag, getArticlesByTagAndCategory } from "@/lib/articles";
import { createPageMetadata, tagPath } from "@/lib/site";
import type { PageProps } from "@/types/page";
import { TagDetailPage } from "./TagDetailPage";

export async function generateMetadata(props: PageProps<"/tags/[tag]">): Promise<Metadata> {
  const params = await props.params!;
  const { category: rawCategory } = await props.searchParams!;
  const decodedTag = decodeURIComponent(params.tag as string);
  const selectedCategory = typeof rawCategory === "string" ? rawCategory.trim() : undefined;

  return createPageMetadata({
    title: `#${decodedTag} 标签文章`,
    description: selectedCategory
      ? `查看标签「${decodedTag}」下分类为「${selectedCategory}」的文章。`
      : `查看标签「${decodedTag}」下的全部文章。`,
    canonical: tagPath(decodedTag, selectedCategory),
  });
}

export default async function TagDetailPageServer(props: PageProps<"/tags/[tag]">) {
  const params = await props.params!;
  const { category: rawCategory } = await props.searchParams!;
  const decodedTag = decodeURIComponent(params.tag as string);
  const selectedCategory = typeof rawCategory === "string" ? rawCategory.trim() : undefined;
  const allArticles = await getArticlesByTag(decodedTag);

  if (allArticles.length === 0) {
    notFound();
  }

  const categories = [...new Set(allArticles.flatMap((article) => article.categories))].sort((a, b) => a.localeCompare(b));
  const articles = await getArticlesByTagAndCategory(decodedTag, selectedCategory);

  return (
    <TagDetailPage
      decodedTag={decodedTag}
      selectedCategory={selectedCategory}
      categories={categories}
      articles={articles}
    />
  );
}
