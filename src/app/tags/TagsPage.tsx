import Link from "next/link";
import { Hash } from "lucide-react";
import { tagPath } from "@/lib/site";

interface TagsPageProps {
  sortedTags: { tag: string; count: number }[];
}

export function TagsPage(props: Readonly<TagsPageProps>) {
  const { sortedTags } = props;
  const maxCount = Math.max(...sortedTags.map((t) => t.count), 1);

  return (
    <main id="main-content" className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-5 py-10 md:px-6 md:py-14">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-green-700 dark:text-green-400">Tag</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-4xl">标签列表</h1>
        </div>
        <Link href="/articles" className="shrink-0 text-sm font-medium text-zinc-500 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:hover:text-zinc-100">
          返回全部文章
        </Link>
      </header>

      <section className="flex flex-wrap justify-center gap-3">
        {sortedTags.map((item) => {
          const size = 0.75 + (item.count / maxCount) * 0.75;
          return (
            <Link
              key={item.tag}
              href={tagPath(item.tag)}
              className="group inline-flex items-baseline gap-2 rounded-md px-3 py-1.5 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:hover:bg-zinc-800"
            >
              <span
                className="font-medium leading-snug text-green-700 transition group-hover:text-green-800 dark:text-green-400 dark:group-hover:text-green-300"
                style={{ fontSize: `${size}rem` }}
              >
                <Hash className="inline h-[1em] w-[1em]" aria-hidden="true" />
                {item.tag}
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {item.count}
              </span>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
