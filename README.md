# blog.changwei.me

Personal blog powered by Next.js App Router.

Article content lives in the repository `articles/` directory and is read directly at build and request time.

## Features

- Read markdown and assets from `articles/**` in this repository
- Support nested article paths through catch-all route `/articles/[...slug]`
- Parse frontmatter (header or trailing metadata block)
- Render markdown with GFM support
- Category + Tag filtering on article list (`/articles?category=...&tag=...`)
- Semantic taxonomy URLs: `/categories/[name]`, `/tags`, `/tags/[name]`
- SEO: sitemap, robots, Open Graph, Twitter cards, JSON-LD
- Permanent redirects from legacy `/blog`, `/category`, `/tag` paths
- Light/Dark theme toggle (default follows system, user choice persisted in `localStorage`)
- Markdown oversized images support horizontal scrolling without breaking layout
- Mobile-friendly navigation and improved focus accessibility
- Category pages and homepage latest list
- RSS feed at `/rss.xml`

## Local Development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:31008`.

## Environment Variables

Set these in your deployment platform (or in a local `.env.local` file).

```bash
# Used by RSS, sitemap, and absolute canonical/OG URLs. Example: https://blog.changwei.me
NEXT_PUBLIC_SITE_URL=https://your-domain.example

# Optional: override articles directory (default: ./articles)
ARTICLES_DIR=articles
```

Notes:

- Next.js automatically loads `.env.local` in development; do not commit `.env.local` to source control.

## Build

```bash
pnpm build
pnpm start
```

## Notes

- This project targets modern Next.js App Router behavior.
- The list and detail pages currently keep native `img` rendering for markdown images to preserve natural width + horizontal scroll behavior.
