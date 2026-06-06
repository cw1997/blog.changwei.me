import type { Metadata } from "next";
import { getAllArticles, getAllCategories } from "@/lib/articles";
import { createPageMetadata } from "@/lib/site";
import type { PageProps } from "@/types/page";
import { CategoriesPage } from "./CategoriesPage";

export const metadata: Metadata = createPageMetadata({
  title: "分类列表",
  description: "按分类浏览文章。",
  canonical: "/categories",
});

export default async function CategoriesPageServer(props: PageProps<"/categories">) {
  const [categories, articles] = await Promise.all([getAllCategories(), getAllArticles()]);

  const countByCategory = new Map<string, number>();
  for (const article of articles) {
    for (const category of article.categories) {
      countByCategory.set(category, (countByCategory.get(category) ?? 0) + 1);
    }
  }

  const sortedCategories = categories
    .map((category) => ({ category, count: countByCategory.get(category) ?? 0 }))
    .sort((a, b) => {
      if (a.count !== b.count) {
        return b.count - a.count;
      }
      return a.category.localeCompare(b.category);
    });

  return <CategoriesPage sortedCategories={sortedCategories} />;
}
