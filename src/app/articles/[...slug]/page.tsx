import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleBySlug, getAllArticles } from "@/lib/articles";
import { absoluteUrl, articlePath, createPageMetadata, getSiteUrl, siteName } from "@/lib/site";
import type { PageProps } from "@/types/page";
import { ArticleDetailPage } from "./ArticleDetailPage";

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((article) => ({ slug: article.slugSegments }));
}

export async function generateMetadata(props: PageProps<"/articles/[...slug]">): Promise<Metadata> {
  const params = await props.params!;
  const slug = params.slug as string[];
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: "文章不存在" };
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

export default async function ArticleDetailPageServer(props: PageProps<"/articles/[...slug]">) {
  const params = await props.params!;
  const slug = params.slug as string[];
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const coverCaption = `${article.title} 封面图`;

  return <ArticleDetailPage article={article} coverCaption={coverCaption} />;
}
