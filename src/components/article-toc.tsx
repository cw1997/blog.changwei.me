"use client";

import { useEffect, useState } from "react";
import type { ArticleHeading } from "@/lib/types";

interface ArticleTocProps {
  headings: ArticleHeading[];
  onNavigate?: () => void;
}

function getIndentClass(level: number): string {
  if (level <= 2) {
    return "pl-0";
  }
  if (level === 3) {
    return "pl-3";
  }
  if (level === 4) {
    return "pl-6";
  }
  return "pl-9";
}

export function ArticleToc(props: Readonly<ArticleTocProps>) {
  const { headings, onNavigate } = props;
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) {
      return;
    }

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0 && visible[0].target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: [0, 0.25, 0.5, 1],
      },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  const onClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      onNavigate?.();
    }
  };

  return (
    <nav aria-label="文章目录">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">目录</p>
      <ul className="space-y-1 border-l border-zinc-200 dark:border-zinc-700">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          return (
            <li key={heading.id} className={getIndentClass(heading.level)}>
              <button
                type="button"
                onClick={() => onClick(heading.id)}
                className={`block w-full border-l-2 py-1 pl-3 text-left text-sm leading-snug transition hover:text-green-700 dark:hover:text-green-400 ${
                  isActive
                    ? "border-green-600 font-medium text-green-700 dark:border-green-400 dark:text-green-400"
                    : "border-transparent text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {heading.text}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
