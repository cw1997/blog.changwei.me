import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticlesByCategory } from "@/lib/articles";

function formatDate(date?: string): string {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
  }).format(new Date(date));
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
    <main id="main-content" className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 md:px-6 md:py-12">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">Category</p>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-4xl">{decodedCategory}</h1>
        </div>
        <Link href="/blog" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-zinc-300 dark:hover:text-zinc-100">
          返回全部文章
        </Link>
      </header>

      <section className="grid gap-4">
        {articles.map((article) => (
          <article key={article.slug} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-200">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              <Link href={`/blog/${article.slug}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 hover:underline">
                {article.title}
              </Link>
            </h2>
            <p className="mt-3 text-zinc-600 dark:text-zinc-300">{article.excerpt || "暂无摘要"}</p>
            <div className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">{formatDate(article.publishedAt)}</div>
          </article>
        ))}
      </section>
    </main>
  );
}
