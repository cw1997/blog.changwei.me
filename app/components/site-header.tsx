"use client";

import Link from "next/link";
import { BookOpenText, ExternalLink, Menu, Rss, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "@/app/components/theme-toggle";

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileNavRef = useRef<HTMLElement | null>(null);

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen || !mobileNavRef.current) {
      return;
    }

    const firstFocusable = mobileNavRef.current.querySelector<HTMLElement>("a, button");
    firstFocusable?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !mobileNavRef.current) {
        return;
      }

      const focusables = Array.from(
        mobileNavRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"),
      );

      if (focusables.length === 0) {
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      menuButtonRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/85">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link
          href="/"
          className="rounded-md text-base font-semibold tracking-tight text-zinc-900 transition hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-zinc-100 dark:hover:text-teal-300 md:text-lg"
          aria-label="返回首页"
          onClick={closeMenu}
        >
          Chang Wei Blog
        </Link>

        <div className="flex items-center gap-2">
          <nav aria-label="主导航" className="hidden items-center gap-2 md:flex">
            <Link
              href="/blog"
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-zinc-600 transition active:scale-[0.98] hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
            >
              <BookOpenText className="h-4 w-4" aria-hidden="true" />
              文章
            </Link>
            <Link
              href="/rss.xml"
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-zinc-600 transition active:scale-[0.98] hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
            >
              <Rss className="h-4 w-4" aria-hidden="true" />
              RSS
            </Link>
            <a
              href="https://github.com/cw1997/blog"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-zinc-600 transition active:scale-[0.98] hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Source
            </a>
          </nav>

          <ThemeToggle />

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 transition active:scale-[0.98] hover:border-zinc-800 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-zinc-700 dark:text-zinc-100 md:hidden"
            aria-label={isOpen ? "收起菜单" : "展开菜单"}
            aria-expanded={isOpen}
            aria-controls="mobile-main-nav"
          >
            {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <nav
          ref={mobileNavRef}
          id="mobile-main-nav"
          aria-label="移动端导航"
          className="border-t border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 md:hidden"
        >
          <div className="grid gap-2">
            <Link
              href="/blog"
              onClick={closeMenu}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-zinc-700 transition active:scale-[0.98] hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              <BookOpenText className="h-4 w-4" aria-hidden="true" />
              文章
            </Link>
            <Link
              href="/rss.xml"
              onClick={closeMenu}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-zinc-700 transition active:scale-[0.98] hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              <Rss className="h-4 w-4" aria-hidden="true" />
              RSS
            </Link>
            <a
              href="https://github.com/cw1997/blog"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-zinc-700 transition active:scale-[0.98] hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Source
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
