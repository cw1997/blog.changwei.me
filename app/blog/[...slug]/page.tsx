import type { Metadata } from "next";
import { CalendarClock, FolderOpen, Tag, UserRound } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getArticleBySlug, getAllArticles } from "@/lib/articles";

function formatDate(date?: string): string {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(date));
}

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((article) => ({ slug: article.slugSegments }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "文章不存在",
    };
  }

  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <main id="main-content" className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8 md:px-6 md:py-10">
      <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-10">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">Article</p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-4xl">{article.title}</h1>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            {formatDate(article.publishedAt)}
          </span>
          {article.author ? (
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="h-4 w-4" aria-hidden="true" />
              {article.author}
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2" aria-label="文章分类">
          {article.categories.map((category) => (
            <Link
              key={`${article.slug}-${category}`}
              href={`/category/${encodeURIComponent(category)}`}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-zinc-100 px-3 text-xs font-medium text-zinc-700 transition hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" />
              {category}
            </Link>
          ))}
        </div>

        {article.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2" aria-label="文章标签">
            {article.tags.map((tag) => (
              <Link
                key={`${article.slug}-${tag}`}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="inline-flex min-h-9 items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-3 text-xs font-medium text-teal-700 transition hover:border-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-teal-900 dark:bg-teal-950/50 dark:text-teal-300"
              >
                <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                {tag}
              </Link>
            ))}
          </div>
        ) : null}

        {article.coverImage ? (
          <div className="md-image-scroll mt-6">
            <Image
              src={article.coverImage}
              alt={`${article.title} 封面图`}
              width={1600}
              height={900}
              unoptimized
              className="h-auto max-w-none"
            />
          </div>
        ) : null}

        <section
          className="markdown-body mt-8"
          dangerouslySetInnerHTML={{
            __html: article.htmlContent,
          }}
        />
      </article>
    </main>
  );
}
