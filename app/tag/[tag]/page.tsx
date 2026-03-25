import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FolderOpen, Hash } from "lucide-react";
import { getArticlesByTag, getArticlesByTagAndCategory } from "@/lib/articles";
import SummaryImageStrip from "@/app/components/summary-image-strip";

function formatDate(date?: string): string {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
  }).format(new Date(date));
}

function buildTagHref(tag: string, category?: string): string {
  if (!category) {
    return `/tag/${encodeURIComponent(tag)}`;
  }

  const query = new URLSearchParams({ category });
  return `/tag/${encodeURIComponent(tag)}?${query.toString()}`;
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

  return {
    title: `#${decodedTag} 标签文章`,
    description: selectedCategory
      ? `查看标签 ${decodedTag} 下分类为 ${selectedCategory} 的文章。`
      : `查看标签 ${decodedTag} 下的全部文章。`,
    alternates: {
      canonical: buildTagHref(decodedTag, selectedCategory),
    },
  };
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
    <main id="main-content" className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 md:px-6 md:py-12">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">Tag</p>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-4xl">#{decodedTag}</h1>
        </div>
        <Link href="/blog" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-zinc-300 dark:hover:text-zinc-100">
          返回全部文章
        </Link>
      </header>

      <section aria-label="标签页分类筛选" className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 md:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            <FolderOpen className="h-4 w-4" aria-hidden="true" />
            在当前标签下筛选分类
          </h2>
          {selectedCategory ? (
            <Link
              href={buildTagHref(decodedTag)}
              className="inline-flex min-h-11 items-center rounded-full border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition active:scale-[0.98] hover:border-zinc-800 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-zinc-700 dark:text-zinc-100"
            >
              清除分类筛选
            </Link>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={buildTagHref(decodedTag)}
            className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
              selectedCategory
                ? "border-zinc-300 text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300"
                : "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
            }`}
          >
            全部分类
          </Link>
          {categories.map((category) => {
            const active = selectedCategory?.toLowerCase() === category.toLowerCase();
            return (
              <Link
                key={category}
                href={buildTagHref(decodedTag, category)}
                className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                  active
                    ? "border-teal-700 bg-teal-700 text-white dark:border-teal-300 dark:bg-teal-300 dark:text-zinc-950"
                    : "border-zinc-300 text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300"
                }`}
              >
                <Hash className="h-3.5 w-3.5" aria-hidden="true" />
                {category}
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-live="polite" aria-atomic="true" className="grid gap-4">
        {articles.length === 0 ? (
          <article className="rounded-2xl border border-dashed border-zinc-300 bg-white p-7 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            当前标签与分类组合下暂无文章，请尝试切换分类。
          </article>
        ) : null}

        {articles.map((article) => (
          <article key={article.slug} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-200">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              <Link href={`/blog/${article.slug}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 hover:underline">
                {article.title}
              </Link>
            </h2>
            <p className="mt-3 text-zinc-600 dark:text-zinc-300">{article.excerpt || "暂无摘要"}</p>
            <SummaryImageStrip images={article.contentImages} title={article.title} />
            <div className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">{formatDate(article.publishedAt)}</div>
          </article>
        ))}
      </section>
    </main>
  );
}