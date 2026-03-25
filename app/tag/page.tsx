import type { Metadata } from "next";
import Link from "next/link";
import { Hash } from "lucide-react";
import { getAllArticles, getAllTags } from "@/lib/articles";

export const metadata: Metadata = {
  title: "标签列表",
  description: "按标签浏览文章。",
  alternates: {
    canonical: "/tag",
  },
};

export default async function TagListPage() {
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

  return (
    <main id="main-content" className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 md:px-6 md:py-12">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">Tag</p>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-4xl">标签列表</h1>
        </div>
        <Link href="/blog" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-zinc-300 dark:hover:text-zinc-100">
          返回全部文章
        </Link>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sortedTags.map((item) => (
          <Link
            key={item.tag}
            href={`/tag/${encodeURIComponent(item.tag)}`}
            className="group rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition duration-200 active:scale-[0.98] hover:-translate-y-0.5 hover:border-teal-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-teal-400"
          >
            <div className="inline-flex items-center gap-2 text-teal-700 dark:text-teal-300">
              <Hash className="h-4 w-4" aria-hidden="true" />
              <span className="text-base font-semibold">{item.tag}</span>
            </div>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{item.count} 篇文章</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
