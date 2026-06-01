# blog.changwei.me

Personal blog powered by Next.js App Router.

Content is fetched from `https://github.com/cw1997/blog` under the `articles/` directory and rendered as pages.

## Features

- Auto-read all markdown files under `cw1997/blog/articles/**`
- Support nested article paths through catch-all route `/blog/[...slug]`
- Parse trailing frontmatter (metadata stored at markdown file tail)
- Render markdown with GFM support
- Category + Tag filtering on article list (`/blog?category=...&tag=...`)
- Light/Dark theme toggle (default follows system, user choice persisted in `localStorage`)
- Markdown oversized images support horizontal scrolling without breaking layout
- Mobile-friendly navigation and improved focus accessibility
- Category pages and homepage latest list
- RSS feed at `/rss.xml`
- On-demand ISR via webhook route `/api/revalidate`

## Local Development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:31006`.

By default this project starts on port `31006` in development:

```bash
pnpm dev
# -> http://localhost:31006
```

## Environment Variables

Set these in your deployment platform (or in a local `.env.local` file).

For local development you can copy the example and fill values:

```bash
cp .env.example .env.local
# then edit .env.local and add real values
```

Example `.env.example` fields:

```bash
# Optional. Helps avoid GitHub API rate limits for private repositories.
GITHUB_TOKEN=your_personal_access_token_here

# Required for triggering on-demand revalidation from GitHub webhook.
REVALIDATE_SECRET=replace-with-a-random-string

# Used by RSS links. Example: https://your-domain.example
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

Notes:

- `GITHUB_TOKEN` should be a Personal Access Token (PAT) with `repo` access for private repositories. Keep this secret and prefer using deployment platform secret stores.
- Next.js automatically loads `.env.local` in development; do not commit `.env.local` to source control.

## GitHub Webhook Setup

In repository `cw1997/blog`:

1. Open Settings -> Webhooks -> Add webhook.
2. Payload URL:

```text
https://your-domain.example/api/revalidate?secret=REVALIDATE_SECRET
```

3. Content type: `application/json`
4. Events: choose `Just the push event`
5. Save.

After each push to `cw1997/blog`, the blog cache is invalidated and pages refresh on next request.

## Build

```bash
pnpm build
pnpm start
```

## Notes

- This project targets modern Next.js App Router behavior.
- On Next.js 16+, `revalidateTag` requires a cache profile argument and is already handled in the implementation.
- The list and detail pages currently keep native `img` rendering for markdown images to preserve natural width + horizontal scroll behavior.
