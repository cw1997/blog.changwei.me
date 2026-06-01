import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FolderOpen, Hash } from "lucide-react";
import { getArticlesByTag, getArticlesByTagAndCategory } from "@/lib/articles";
import { articlePath, createPageMetadata, tagPath } from "@/lib/site";
import SummaryImageStrip from "@/components/summary-image-strip";

function formatDate(date?: string): string {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
  }).format(new Date(date));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ category?: string }>;
}): Promise<Metadata> {
  const [{ tag }, search] = await Promise.all([params, searchParams]);
  const decodedTag = decodeURIComponent(tag);
  const selectedCategory = search.category?.trim();

  return createPageMetadata({
    title: `#${decodedTag} 标签文章`,
    description: selectedCategory
      ? `查看标签「${decodedTag}」下分类为「${selectedCategory}」的文章。`
      : `查看标签「${decodedTag}」下的全部文章。`,
    canonical: tagPath(decodedTag, selectedCategory),
  });
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const [{ tag }, search] = await Promise.all([params, searchParams]);
  const decodedTag = decodeURIComponent(tag);
  const selectedCategory = search.category?.trim();
  const allArticles = await getArticlesByTag(decodedTag);

  if (allArticles.length === 0) {
    notFound();
  }

  const categories = [...new Set(allArticles.flatMap((article) => article.categories))].sort((a, b) => a.localeCompare(b));
  const articles = await getArticlesByTagAndCategory(decodedTag, selectedCategory);

  return (
    <main id="main-content" className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-5 py-10 md:px-6 md:py-14">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-green-700 dark:text-green-400">Tag</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-4xl">
            <Hash className="inline h-[1em] w-[1em]" aria-hidden="true" />
            {decodedTag}
          </h1>
        </div>
        <Link href="/articles" className="shrink-0 text-sm font-medium text-zinc-500 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:hover:text-zinc-100">
          返回全部文章
        </Link>
      </header>

      <section aria-label="标签页分类筛选" className="border-b border-zinc-100 pb-6 dark:border-zinc-800">
        <div className="flex items-center justify-between gap-3">
          <h2 className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" />
            在当前标签下筛选分类
          </h2>
          {selectedCategory ? (
            <Link
              href={tagPath(decodedTag)}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:hover:text-zinc-100"
            >
              清除分类筛选
            </Link>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <Link
            href={tagPath(decodedTag)}
            className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 ${
              selectedCategory
                ? "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            }`}
          >
            全部分类
          </Link>
          {categories.map((category) => {
            const active = selectedCategory?.toLowerCase() === category.toLowerCase();
            return (
              <Link
                key={category}
                href={tagPath(decodedTag, category)}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 ${
                  active
                    ? "bg-green-700 text-white dark:bg-green-600 dark:text-white"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                }`}
              >
                <Hash className="h-3 w-3" aria-hidden="true" />
                {category}
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-live="polite" aria-atomic="true" className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {articles.length === 0 ? (
          <p className="py-10 text-center text-sm text-zinc-400 dark:text-zinc-500">
            当前标签与分类组合下暂无文章，请尝试切换分类。
          </p>
        ) : null}

        {articles.map((article) => (
          <article key={article.slug} className="py-7 first:pt-0 last:pb-0">
            <h2 className="text-xl font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
              <Link
                href={articlePath(article.slug)}
                className="transition hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:hover:text-green-400"
              >
                {article.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-2">
              {article.excerpt || "暂无摘要"}
            </p>
            <SummaryImageStrip images={article.contentImages} title={article.title} />
            <div className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">{formatDate(article.publishedAt)}</div>
          </article>
        ))}
      </section>
    </main>
  );
}
