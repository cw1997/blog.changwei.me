import Link from "next/link";
import { ArrowRight, CalendarClock, Rss } from "lucide-react";
import { getAllCategories, getAllTags, getLatestArticles } from "@/lib/articles";
import SummaryImageStrip from "@/components/summary-image-strip";

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
    <main id="main-content" className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-5 py-10 md:px-6 md:py-14">
      <section className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-5xl">
          昌维的博客
        </h1>
        {/*<p className="mt-4 text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
          内容来自 github.com/cw1997/blog 仓库的 articles 目录。使用 Next.js App Router 与增量更新机制，推送后即可刷新文章列表与详情内容。
        </p>*/}
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            浏览全部文章
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/rss.xml"
            className="inline-flex items-center gap-2 rounded-md border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-100"
          >
            <Rss className="h-4 w-4" aria-hidden="true" />
            订阅 RSS
          </Link>
        </div>
      </section>

      <div className="grid gap-14 md:grid-cols-[1.6fr_1fr]">
        <section>
          <div className="flex items-end justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">最新文章</h2>
            <Link
              href="/blog"
              className="text-sm font-medium text-zinc-500 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:hover:text-zinc-100"
            >
              查看全部
            </Link>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {latestArticles.map((article) => (
              <article key={article.slug} className="py-6 first:pt-4 last:pb-0">
                <h3 className="text-xl font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
                  <Link
                    href={`/blog/${article.slug}`}
                    className="transition hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:hover:text-green-400"
                  >
                    {article.title}
                  </Link>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-2">
                  {article.excerpt || "暂无摘要"}
                </p>
                <SummaryImageStrip images={article.contentImages} title={article.title} />
                <div className="mt-3 inline-flex items-center gap-1.5 text-sm text-zinc-400 dark:text-zinc-500">
                  <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                  {formatDate(article.publishedAt)}
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-8 md:border-l md:border-zinc-100 md:pl-8 dark:md:border-zinc-800">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              分类
            </h2>
            <ul className="mt-4 space-y-2">
              {categories.map((category) => (
                <li key={category}>
                  <Link
                    href={`/category/${encodeURIComponent(category)}`}
                    className="block rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              标签
            </h2>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tag/${encodeURIComponent(tag)}`}
                  className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium text-zinc-500 transition hover:bg-zinc-50 hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-green-400"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
