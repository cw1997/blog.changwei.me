import Link from "next/link";
import { ArrowRight, CalendarClock, FolderOpen, Rss, Tag } from "lucide-react";
import { getAllCategories, getAllTags, getLatestArticles } from "@/lib/articles";
import SummaryImageStrip from "@/app/components/summary-image-strip";

function formatDate(date?: string): string {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
  }).format(new Date(date));
}

export default async function Home() {
  const [latestArticles, categories, tags] = await Promise.all([
    getLatestArticles(8),
    getAllCategories(),
    getAllTags(),
  ]);

  return (
    <main id="main-content" className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-8 md:gap-14 md:px-6 md:py-14">
      <section className="fade-in-up relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-white via-teal-50 to-cyan-100 p-6 md:p-12 dark:border-zinc-700 dark:from-zinc-900 dark:via-teal-950/60 dark:to-cyan-950/50">
        <div className="relative z-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">Personal Blog</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-5xl">自动同步 GitHub 文章的个人博客</h1>
          <p className="mt-5 text-base leading-7 text-zinc-700 dark:text-zinc-300 md:text-lg">
            内容来自 github.com/cw1997/blog 仓库的 articles 目录。使用 Next.js App Router 与增量更新机制，推送后即可刷新文章列表与详情内容。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/blog" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">
              浏览全部文章
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/rss.xml" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-zinc-900 px-5 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-100 dark:hover:text-zinc-900">
              <Rss className="h-4 w-4" aria-hidden="true" />
              订阅 RSS
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-300/40 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 left-20 h-52 w-52 rounded-full bg-cyan-300/40 blur-2xl" />
      </section>

      <section className="grid gap-10 md:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">最新文章</h2>
            <Link href="/blog" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-zinc-300 dark:hover:text-zinc-100">
              查看全部
            </Link>
          </div>
          {latestArticles.map((article) => (
            <article key={article.slug} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-200">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                <Link href={`/blog/${article.slug}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 hover:underline">
                  {article.title}
                </Link>
              </h3>
              <p className="mt-2 text-zinc-600 dark:text-zinc-300">{article.excerpt || "暂无摘要"}</p>
              <SummaryImageStrip images={article.contentImages} title={article.title} />
              <div className="mt-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                <CalendarClock className="h-4 w-4" aria-hidden="true" />
                {formatDate(article.publishedAt)}
              </div>
            </article>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="inline-flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            <FolderOpen className="h-5 w-5" aria-hidden="true" />
            分类
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/category/${encodeURIComponent(category)}`}
                className="inline-flex min-h-11 items-center rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 transition active:scale-[0.98] hover:bg-zinc-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-100 dark:hover:text-zinc-900"
              >
                {category}
              </Link>
            ))}
          </div>

          <h2 className="mt-8 inline-flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            <Tag className="h-5 w-5" aria-hidden="true" />
            标签
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/tag/${encodeURIComponent(tag)}`}
                className="inline-flex min-h-11 items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm text-teal-700 transition active:scale-[0.98] hover:border-teal-300 hover:bg-teal-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-teal-900 dark:bg-teal-950/50 dark:text-teal-300 dark:hover:bg-teal-900/60"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
