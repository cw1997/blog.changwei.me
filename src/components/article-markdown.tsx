"use client";

type ArticleMarkdownProps = {
  html: string;
  className?: string;
};

export default function ArticleMarkdown({ html, className }: ArticleMarkdownProps) {
  return (
    <section
      className={className ?? "markdown-body"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
