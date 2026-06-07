"use client";

import { ArticleShareDialog } from "@/components/article-share-dialog";
import { ArrowUp, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

const SCROLL_THRESHOLD = 300;

interface ArticleFloatingActionsProps {
  title: string;
  excerpt: string;
  permalink: string;
}

const fabClassName =
  "inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-md transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800";

export function ArticleFloatingActions(props: Readonly<ArticleFloatingActionsProps>) {
  const { title, excerpt, permalink } = props;
  const [shareOpen, setShareOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const onMotionChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", onMotionChange);
    return () => {
      mediaQuery.removeEventListener("change", onMotionChange);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > SCROLL_THRESHOLD);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const onBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <>
      <div className="fixed bottom-6 right-5 z-40 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className={fabClassName}
          aria-label="分享文章"
        >
          <Share2 className="h-5 w-5" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onBackToTop}
          className={`${fabClassName} transition-opacity duration-200 ${
            showBackToTop ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-label="回到顶部"
          aria-hidden={!showBackToTop}
          tabIndex={showBackToTop ? 0 : -1}
        >
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <ArticleShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title={title}
        excerpt={excerpt}
        permalink={permalink}
      />
    </>
  );
}
