"use client";

interface ArticleMarkdownProps {
  html: string;
  className?: string;
}

export function ArticleMarkdown(props: Readonly<ArticleMarkdownProps>) {
  const { html, className } = props;
  return (
    <section
      className={className ?? "markdown-body"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
