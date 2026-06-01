import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, FolderOpen, Image as ImageIcon, SlidersHorizontal, Tag } from "lucide-react";
import { getAllArticles, getAllCategories, getAllTags } from "@/lib/articles";
import SummaryImageStrip from "@/components/summary-image-strip";

function formatDate(date?: string): string {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function buildBlogHref(category?: string, tag?: string): string {
  const query = new URLSearchParams();

  if (category) {
    query.set("category", category);
  }
  if (tag) {
    query.set("tag", tag);
  }

  const value = query.toString();
  return value ? `/blog?${value}` : "/blog";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const category = params.category?.trim();
  const tag = params.tag?.trim();

  return {
    title: "全部文章",
    description: "按分类与标签浏览所有文章。",
    alternates: {
      canonical: buildBlogHref(category, tag),
    },
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const selectedCategory = params.category?.trim();
  const selectedTag = params.tag?.trim();
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
    <main id="main-content" className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-5 py-10 md:px-6 md:py-14">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-5xl">全部文章</h1>
        <p className="mt-3 text-lg text-zinc-500 dark:text-zinc-400">自动同步自 GitHub 仓库 cw1997/blog/articles，支持多层目录文章。</p>
      </header>

      <section aria-label="文章筛选" className="space-y-4 border-b border-zinc-100 pb-6 dark:border-zinc-800">
        <div className="flex items-center justify-between gap-3">
          <h2 className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            筛选条件
          </h2>
          {(selectedCategory || selectedTag) && (
            <Link
              href="/blog"
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:hover:text-zinc-100"
            >
              清除筛选
            </Link>
          )}
        </div>

        <div className="flex items-start gap-2">
          <FolderOpen className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" aria-hidden="true" />
          <div className="flex flex-wrap gap-1.5">
            <Link
              href={buildBlogHref(undefined, selectedTag)}
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
                  href={buildBlogHref(category, selectedTag)}
                  className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 ${
                    active
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  }`}
                >
                  {category}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Tag className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" aria-hidden="true" />
          <div className="flex flex-wrap gap-1.5">
            <Link
              href={buildBlogHref(selectedCategory)}
              className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 ${
                selectedTag
                  ? "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              }`}
            >
              全部标签
            </Link>
            {tags.map((tag) => {
              const active = selectedTag?.toLowerCase() === tag.toLowerCase();
              return (
                <Link
                  key={tag}
                  href={buildBlogHref(selectedCategory, tag)}
                  className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 ${
                    active
                      ? "bg-green-700 text-white dark:bg-green-600 dark:text-white"
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  }`}
                >
                  #{tag}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section aria-live="polite" aria-atomic="true" className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {articles.length === 0 && (
          <p className="py-10 text-center text-sm text-zinc-400 dark:text-zinc-500">
            当前筛选条件下暂无文章，尝试切换分类或标签。
          </p>
        )}

        {articles.map((article) => (
          <article key={article.slug} className="py-7 first:pt-0 last:pb-0">
            <div className="mb-2.5 flex flex-wrap gap-1.5">
              {article.categories.map((category) => (
                <Link
                  key={`${article.slug}-${category}`}
                  href={`/category/${encodeURIComponent(category)}`}
                  className="inline-flex items-center rounded-md bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  {category}
                </Link>
              ))}
              {article.tags.map((tag) => (
                <Link
                  key={`${article.slug}-${tag}`}
                  href={buildBlogHref(selectedCategory, tag)}
                  className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium text-green-700 transition hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:text-green-400 dark:hover:bg-green-950/50"
                >
                  #{tag}
                </Link>
              ))}
            </div>

            <h2 className="text-2xl font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
              <Link
                href={`/blog/${article.slug}`}
                className="transition hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:hover:text-green-400"
              >
                {article.title}
              </Link>
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-2">
              {article.excerpt || "暂无摘要"}
            </p>
            <SummaryImageStrip images={article.contentImages} title={article.title} />

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-zinc-400 dark:text-zinc-500">
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                {formatDate(article.publishedAt)}
              </span>
              {article.author ? <span>{article.author}</span> : null}
              {article.previewImage ? (
                <span className="inline-flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  含配图
                </span>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
