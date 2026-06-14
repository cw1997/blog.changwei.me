"use client";

import { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface ArticleMarkdownProps {
  html: string;
  className?: string;
}

export function ArticleMarkdown(props: Readonly<ArticleMarkdownProps>) {
  const { html, className } = props;
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current?.querySelector(".mermaid")) return;
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? "dark" : "default",
      });
      mermaid.run({ querySelector: ".mermaid" }).catch(() => {});
    } catch {
      // Gracefully handle mermaid render errors
    }
  }, [html]);

  return (
    <section
      ref={sectionRef}
      className={className ?? "markdown-body"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
