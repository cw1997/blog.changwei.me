import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticlesByCategory } from "@/lib/articles";
import { categoryPath, createPageMetadata } from "@/lib/site";
import type { PageProps } from "@/types/page";
import { CategoryDetailPage } from "./CategoryDetailPage";

export async function generateMetadata(props: PageProps<"/categories/[category]">): Promise<Metadata> {
  const params = await props.params!;
  const decodedCategory = decodeURIComponent(params.category as string);

  return createPageMetadata({
    title: `${decodedCategory} 分类文章`,
    description: `查看分类「${decodedCategory}」下的全部文章。`,
    canonical: categoryPath(decodedCategory),
  });
}

export default async function CategoryDetailPageServer(props: PageProps<"/categories/[category]">) {
  const params = await props.params!;
  const decodedCategory = decodeURIComponent(params.category as string);
  const articles = await getArticlesByCategory(decodedCategory);

  if (articles.length === 0) {
    notFound();
  }

  return <CategoryDetailPage decodedCategory={decodedCategory} articles={articles} />;
}
