import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { categoryPath } from "@/lib/site";

interface CategoriesPageProps {
  sortedCategories: { category: string; count: number }[];
}

export function CategoriesPage(props: Readonly<CategoriesPageProps>) {
  const { sortedCategories } = props;

  return (
    <main id="main-content" className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-5 py-10 md:px-6 md:py-14">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-green-700 dark:text-green-400">Category</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-4xl">分类列表</h1>
        </div>
        <Link
          href="/articles"
          className="shrink-0 text-sm font-medium text-zinc-500 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:hover:text-zinc-100"
        >
          返回全部文章
        </Link>
      </header>

      <section className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {sortedCategories.map((item) => (
          <Link
            key={item.category}
            href={categoryPath(item.category)}
            className="group flex items-center justify-between gap-4 py-4 transition first:pt-0 last:pb-0 hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:hover:text-green-400"
          >
            <span className="inline-flex items-center gap-2 text-base font-medium text-zinc-700 group-hover:text-green-700 dark:text-zinc-300 dark:group-hover:text-green-400">
              <FolderOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.category}
            </span>
            <span className="shrink-0 text-sm text-zinc-400 dark:text-zinc-500">{item.count} 篇</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
