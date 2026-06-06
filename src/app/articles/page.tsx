import type { Metadata } from "next";
import { getAllArticles, getAllCategories, getAllTags } from "@/lib/articles";
import { buildArticlesHref, createPageMetadata } from "@/lib/site";
import type { PageProps } from "@/types/page";
import { ArticlesPage } from "./ArticlesPage";

export async function generateMetadata(props: PageProps<"/articles">): Promise<Metadata> {
  const { category: rawCategory, tag: rawTag } = await props.searchParams!;
  const category = typeof rawCategory === "string" ? rawCategory.trim() : undefined;
  const tag = typeof rawTag === "string" ? rawTag.trim() : undefined;

  const title = category && tag
    ? `${category} · #${tag} 文章`
    : category
      ? `${category} 分类文章`
      : tag
        ? `#${tag} 标签文章`
        : "全部文章";

  const description = category && tag
    ? `浏览分类「${category}」且标签为「${tag}」的文章。`
    : category
      ? `浏览分类「${category}」下的全部文章。`
      : tag
        ? `浏览标签「${tag}」下的全部文章。`
        : "按分类与标签浏览所有文章。";

  return createPageMetadata({
    title,
    description,
    canonical: buildArticlesHref(category, tag),
  });
}

export default async function ArticlesPageServer(props: PageProps<"/articles">) {
  const { category: rawCategory, tag: rawTag } = await props.searchParams!;
  const selectedCategory = typeof rawCategory === "string" ? rawCategory.trim() : undefined;
  const selectedTag = typeof rawTag === "string" ? rawTag.trim() : undefined;

  const [allArticles, categories, tags] = await Promise.all([
    getAllArticles(),
    getAllCategories(),
    getAllTags(),
  ]);

  const articles = allArticles.filter((article) => {
    const categoryMatched = selectedCategory
      ? article.categories.some(
          (category) => category.toLowerCase() === selectedCategory.toLowerCase(),
        )
      : true;

    const tagMatched = selectedTag
      ? article.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())
      : true;

    return categoryMatched && tagMatched;
  });

  return (
    <ArticlesPage
      articles={articles}
      categories={categories}
      tags={tags}
      selectedCategory={selectedCategory}
      selectedTag={selectedTag}
    />
  );
}
