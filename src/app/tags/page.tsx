import type { Metadata } from "next";
import { getAllArticles, getAllTags } from "@/lib/articles";
import { createPageMetadata } from "@/lib/site";
import type { PageProps } from "@/types/page";
import { TagsPage } from "./TagsPage";

export const metadata: Metadata = createPageMetadata({
  title: "标签列表",
  description: "按标签浏览文章。",
  canonical: "/tags",
});

export default async function TagsPageServer(props: PageProps<"/tags">) {
  const [tags, articles] = await Promise.all([getAllTags(), getAllArticles()]);

  const countByTag = new Map<string, number>();
  for (const article of articles) {
    for (const tag of article.tags) {
      countByTag.set(tag, (countByTag.get(tag) ?? 0) + 1);
    }
  }

  const sortedTags = tags
    .map((tag) => ({ tag, count: countByTag.get(tag) ?? 0 }))
    .sort((a, b) => {
      if (a.count !== b.count) {
        return b.count - a.count;
      }
      return a.tag.localeCompare(b.tag);
    });

  return <TagsPage sortedTags={sortedTags} />;
}
