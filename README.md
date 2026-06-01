# blog.changwei.me

Personal blog powered by Next.js App Router.

Content is synced from `cw1997/blog/articles` into `/tmp/articles` before build, then rendered from that local mirror.

## Features

- Sync all markdown and asset files under `cw1997/blog/articles/**` into `/tmp/articles`
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
pnpm sync:articles
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

If your content repository is not `cw1997/blog` you can override the coordinates used by the sync script:

```bash
# Optional: override the owner/repo/branch used to fetch articles
GITHUB_OWNER=your_github_username_or_org
GITHUB_REPO=your_content_repo_name
GITHUB_BRANCH=main
ARTICLES_MIRROR_ROOT=/tmp/articles
```
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

After each sync + build, the site reads article content from the local mirror instead of GitHub at request time.

## Build

```bash
pnpm build
pnpm start
```

`pnpm build` automatically runs `pnpm sync:articles` first.

## Notes

- This project targets modern Next.js App Router behavior.
- On Next.js 16+, `revalidateTag` requires a cache profile argument and is already handled in the implementation.
- The list and detail pages currently keep native `img` rendering for markdown images to preserve natural width + horizontal scroll behavior.
