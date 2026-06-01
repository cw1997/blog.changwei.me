export interface ArticleFrontmatter {
  title?: string;
  slug?: string;
  date?: string;
  author?: string;
  category?: string | string[];
  tag?: string | string[];
  cover_image?: string;
  language?: string;
}

export interface Article {
  slug: string;
  slugSegments: string[];
  sourcePath: string;
  title: string;
  excerpt: string;
  excerptSource: "first-paragraph";
  htmlContent: string;
  markdownContent: string;
  author?: string;
  categories: string[];
  tags: string[];
  coverImage?: string;
  previewImage?: string;
  contentImages: string[];
  publishedAt?: string;
  language?: string;
}

export interface GitTreeItem {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
  url: string;
}

export interface GitTreeResponse {
  sha: string;
  truncated: boolean;
  tree: GitTreeItem[];
}
