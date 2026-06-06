"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { BookOpenText, FolderOpen, Home, Menu, Rss, Tags, X, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GitHubIcon } from "@/components/brand-icons";
import { ScrollProgressBar } from "@/components/scroll-progress-bar";
import { ThemeToggle } from "@/components/theme-toggle";

interface SiteHeaderProps {
  // no props
}

interface MainNavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

const mainNavLinks: MainNavLink[] = [
  { href: "/articles", label: "文章", icon: BookOpenText },
  { href: "/categories", label: "分类", icon: FolderOpen },
  { href: "/tags", label: "标签", icon: Tags },
  { href: "/rss.xml", label: "RSS", icon: Rss },
];

interface ExternalNavLink {
  href: string;
  label: string;
  icon: LucideIcon | ComponentType<{ className?: string }>;
}

const externalNavLinks: ExternalNavLink[] = [
  { href: "https://www.changwei.me", label: "个人主页", icon: Home },
  { href: "https://github.com/cw1997", label: "GitHub", icon: GitHubIcon },
];

const iconLinkClassName =
  "inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100";

export function SiteHeader(props: Readonly<SiteHeaderProps>) {
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
    <header className="sticky top-0 z-30 relative border-b border-zinc-100 bg-[var(--chrome)]/95 backdrop-blur dark:border-zinc-800">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-3.5 md:px-6">
        <Link
          href="/"
          className="text-base font-bold tracking-tight text-zinc-900 transition hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:text-zinc-100 dark:hover:text-green-400 md:text-lg"
          aria-label="返回首页"
          onClick={closeMenu}
        >
          <span className="text-green-700">Chang Wei Blog</span>
          <span className="text-zinc-900 ml-2 pl-2 border-l-[2px] border-zinc-300 dark:border-zinc-800 dark:text-zinc-100">昌维的博客</span>
        </Link>

        <div className="flex items-center gap-1">
          <nav aria-label="主导航" className="hidden items-center gap-0.5 md:flex">
            {mainNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <nav aria-label="外部链接" className="flex items-center gap-0.5">
            {externalNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.label}
                  title={link.label}
                  className={iconLinkClassName}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              );
            })}
          </nav>

          <ThemeToggle />

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 md:hidden"
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
          className="border-t border-zinc-100 bg-[var(--chrome)] px-5 py-2 dark:border-zinc-800 md:hidden"
        >
          <div className="grid gap-1">
            {mainNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
      <ScrollProgressBar />
    </header>
  );
}
