import type { Metadata } from "next";
import { CalendarClock, FolderOpen, Tag, UserRound } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getArticleBySlug, getAllArticles } from "@/lib/articles";
import {
  absoluteUrl,
  articlePath,
  categoryPath,
  createPageMetadata,
  getSiteUrl,
  siteName,
  tagPath,
} from "@/lib/site";
import JsonLd from "@/components/json-ld";

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

  const canonical = articlePath(article.slug);

  return createPageMetadata({
    title: article.title,
    description: article.excerpt || `${article.title} - ${siteName}`,
    canonical,
    openGraphType: "article",
    publishedTime: article.publishedAt,
    keywords: article.tags,
    images: article.previewImage
      ? [{ url: article.previewImage, alt: `${article.title} 配图` }]
      : undefined,
  });
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const canonical = articlePath(article.slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    author: article.author
      ? { "@type": "Person", name: article.author }
      : { "@type": "Person", name: siteName },
    image: article.previewImage ?? article.coverImage,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(canonical),
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: getSiteUrl(),
    },
  };

  return (
    <main id="main-content" className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-10 md:px-6 md:py-14">
      <JsonLd data={jsonLd} />
      <article className="w-full">
        <header className="mx-auto w-full max-w-[720px]">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-green-700 dark:text-green-400">Article</p>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-zinc-100 md:text-4xl lg:text-[2.6rem]">{article.title}</h1>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
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

          <nav className="mt-4 flex flex-wrap gap-1.5" aria-label="文章分类与标签">
            {article.categories.map((category) => (
              <Link
                key={`${article.slug}-${category}`}
                href={categoryPath(category)}
                className="inline-flex items-center gap-1 rounded-md bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:bg-zinc-800 dark:text-zinc-400"
              >
                <FolderOpen className="h-3 w-3" aria-hidden="true" />
                {category}
              </Link>
            ))}
            {article.tags.map((tag) => (
              <Link
                key={`${article.slug}-${tag}`}
                href={tagPath(tag)}
                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-green-700 transition hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:text-green-400 dark:hover:bg-green-950/50"
              >
                <Tag className="h-3 w-3" aria-hidden="true" />
                {tag}
              </Link>
            ))}
          </nav>
        </header>

        <div className="mx-auto mt-8 w-full max-w-[720px]">
          {article.coverImage ? (
            <div className="-mx-5 md:-mx-10">
              <figure className="md-image-scroll">
                <Image
                  src={article.coverImage}
                  alt={`${article.title} 封面图`}
                  width={1600}
                  height={900}
                  unoptimized
                  className="h-auto w-full"
                />
              </figure>
            </div>
          ) : null}

          <section
            className="markdown-body mt-10"
            dangerouslySetInnerHTML={{
              __html: article.htmlContent,
            }}
          />
        </div>
      </article>
    </main>
  );
}
