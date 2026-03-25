import Link from "next/link";
import Image from "next/image";
import { CalendarClock, FolderOpen, Tag } from "lucide-react";
import { getAllArticles, getAllCategories, getAllTags } from "@/lib/articles";

function formatDate(date?: string): string {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
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

  const buildFilterHref = (category?: string, tag?: string) => {
    const query = new URLSearchParams();

    if (category) {
      query.set("category", category);
    }
    if (tag) {
      query.set("tag", tag);
    }

    const value = query.toString();
    return value ? `/blog?${value}` : "/blog";
  };

  return (
    <main id="main-content" className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 md:px-6 md:py-12">
      <header className="flex flex-col gap-4">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">Blog</p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-4xl">全部文章</h1>
        <p className="max-w-2xl text-base text-zinc-600 dark:text-zinc-300">自动同步自 GitHub 仓库 cw1997/blog/articles，支持多层目录文章。</p>
      </header>

      <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 md:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">筛选条件</h2>
          {(selectedCategory || selectedTag) && (
            <Link
              href="/blog"
              className="inline-flex min-h-11 items-center rounded-full border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition hover:border-zinc-800 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-zinc-700 dark:text-zinc-100"
            >
              清除筛选
            </Link>
          )}
        </div>

        <div className="flex items-start gap-3">
          <FolderOpen className="mt-2 h-4 w-4 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildFilterHref(undefined, selectedTag)}
              className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
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
                  href={buildFilterHref(category, selectedTag)}
                  className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                    active
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                      : "border-zinc-300 text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {category}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Tag className="mt-2 h-4 w-4 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildFilterHref(selectedCategory)}
              className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                selectedTag
                  ? "border-zinc-300 text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300"
                  : "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
              }`}
            >
              全部标签
            </Link>
            {tags.map((tag) => {
              const active = selectedTag?.toLowerCase() === tag.toLowerCase();
              return (
                <Link
                  key={tag}
                  href={buildFilterHref(selectedCategory, tag)}
                  className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                    active
                      ? "border-teal-700 bg-teal-700 text-white dark:border-teal-300 dark:bg-teal-300 dark:text-zinc-950"
                      : "border-zinc-300 text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  #{tag}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        {articles.length === 0 && (
          <article className="rounded-2xl border border-dashed border-zinc-300 bg-white p-7 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            当前筛选条件下暂无文章，尝试切换分类或标签。
          </article>
        )}

        {articles.map((article) => (
          <article key={article.slug} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-200 md:p-6">
            {article.coverImage && (
              <div className="mb-4 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <Image
                  src={article.coverImage}
                  alt={`${article.title} 封面图`}
                  width={1600}
                  height={900}
                  unoptimized
                  className="h-auto max-w-none"
                />
              </div>
            )}

            <div className="mb-3 flex flex-wrap gap-2">
              {article.categories.map((category) => (
                <Link
                  key={`${article.slug}-${category}`}
                  href={`/category/${encodeURIComponent(category)}`}
                  className="inline-flex min-h-9 items-center rounded-full bg-zinc-100 px-3 text-xs font-medium text-zinc-700 transition hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  {category}
                </Link>
              ))}
              {article.tags.map((tag) => (
                <Link
                  key={`${article.slug}-${tag}`}
                  href={buildFilterHref(selectedCategory, tag)}
                  className="inline-flex min-h-9 items-center rounded-full border border-teal-200 bg-teal-50 px-3 text-xs font-medium text-teal-700 transition hover:border-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-teal-900 dark:bg-teal-950/50 dark:text-teal-300"
                >
                  #{tag}
                </Link>
              ))}
            </div>

            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              <Link href={`/blog/${article.slug}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 hover:underline">
                {article.title}
              </Link>
            </h2>

            <p className="mt-3 text-zinc-600 dark:text-zinc-300">{article.excerpt || "暂无摘要"}</p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="h-4 w-4" aria-hidden="true" />
                {formatDate(article.publishedAt)}
              </span>
              {article.author ? <span>{article.author}</span> : null}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
