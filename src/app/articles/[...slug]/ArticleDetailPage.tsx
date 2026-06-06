import Link from "next/link";
import { CalendarClock, FolderOpen, Tag, UserRound } from "lucide-react";
import type { Article } from "@/lib/types";
import { categoryPath, languageLabel, tagPath } from "@/lib/site";
import { ArticleContentEnhancer } from "@/components/article-content-enhancer";
import { ArticleMarkdown } from "@/components/article-markdown";
import { ArticleShareBar } from "@/components/article-share-bar";
import { ArticleToc } from "@/components/article-toc";
import { ArticleTocDrawer } from "@/components/article-toc-drawer";

interface ArticleDetailPageProps {
  article: Article;
  coverCaption: string;
  permalink: string;
}

function formatDate(date?: string): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "full", timeStyle: "short" }).format(new Date(date));
}

export function ArticleDetailPage(props: Readonly<ArticleDetailPageProps>) {
  const { article, coverCaption, permalink } = props;

  return (
    <main id="main-content" className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 py-10 md:px-6 md:py-14">
      <div className="flex w-full gap-8">
        <aside className="hidden w-56 shrink-0 xl:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
            <ArticleToc headings={article.headings} />
          </div>
        </aside>

        <article className="min-w-0 w-full max-w-3xl flex-1">
          <header className="w-full">
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
              {languageLabel(article.language) ? (
                <span className="inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  {languageLabel(article.language)}
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

          <ArticleTocDrawer headings={article.headings} />

          <ArticleContentEnhancer>
            <div className="mt-8 w-full">
              {article.coverImage ? (
                <figure className="md-image-block md-image-block-cover">
                  <div className="md-image-scroll" data-md-image-scroll>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.coverImage}
                      alt={coverCaption}
                      data-md-image-zoom
                      className="cursor-zoom-in"
                    />
                  </div>
                  <figcaption className="md-image-caption">{coverCaption}</figcaption>
                </figure>
              ) : null}

              <ArticleShareBar permalink={permalink} title={article.title} />
              <ArticleMarkdown html={article.htmlContent} className="markdown-body mt-10" />
            </div>
          </ArticleContentEnhancer>
        </article>
      </div>
    </main>
  );
}
