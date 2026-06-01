import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { getArticlesByCategory } from "@/lib/articles";
import SummaryImageStrip from "@/app/components/summary-image-strip";

function formatDate(date?: string): string {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
  }).format(new Date(date));
}

function buildCategoryHref(category: string): string {
  return `/category/${encodeURIComponent(category)}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);

  return {
    title: `${decodedCategory} 分类文章`,
    description: `查看分类 ${decodedCategory} 下的全部文章。`,
    alternates: {
      canonical: buildCategoryHref(decodedCategory),
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const articles = await getArticlesByCategory(decodedCategory);

  if (articles.length === 0) {
    notFound();
  }

  return (
    <main id="main-content" className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-5 py-10 md:px-6 md:py-14">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-green-700 dark:text-green-400">Category</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-4xl">{decodedCategory}</h1>
        </div>
        <Link href="/blog" className="shrink-0 text-sm font-medium text-zinc-500 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:hover:text-zinc-100">
          返回全部文章
        </Link>
      </header>

      <section className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {articles.map((article) => (
          <article key={article.slug} className="py-7 first:pt-0 last:pb-0">
            <h2 className="text-xl font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
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
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
              <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDate(article.publishedAt)}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
