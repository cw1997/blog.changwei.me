# Project Rules

## Pages (`page.tsx`)
- Server/Client split: server fetches data; client `{Name}Page` renders via props only
- Server: async — `await params`/`searchParams` (both `Promise`), `redirect()`, `generateMetadata`, SEO
- Client: `"./{Name}Page.tsx"`, props only, `"use client"` only for interactivity/state/browser APIs
- Name = path segments in PascalCase; skip route groups, `[...]` dynamic params, `page.tsx`
- Types: `PageProps<"/route/path">` from `@/types/page`

```tsx
import { NamePage } from "./NamePage";
import type { PageProps } from "@/types/page";
export default async function NamePageServer(props: PageProps<"/route">) {
  return <NamePage data={...} />;
}
```

## Layouts (`layout.tsx`)
- `LayoutProps<"/route">` from `@/types/page`; `params` is `Promise`, `children` is `React.ReactNode`
- Root layout: `{ children: React.ReactNode }` (no route params)

## Exports
- Named exports (`export function` / `export const`) in all `.tsx`
- Exceptions: `page.tsx`, `layout.tsx`, `error.tsx`, `loading.tsx`, `*.stories.tsx`

## Components
- Props: `{Name}Props` interface, `props: Readonly<{Name}Props>`, destructure first
- Name matches filename stem (PascalCase)
- No manual `useMemo`/`useCallback`/`React.memo` unless profiled (React Compiler)
- **Colocation**: single-reference components live in the caller's directory (同级目录), sibling not nested; promote to `@/components/` only when shared by 2+ callers or the caller is `page.tsx`/`layout.tsx`

## TypeScript
- `strict: true`; `PageProps<T>` / `LayoutProps<T>` from `@/types/page`; avoid `any` (use `unknown`)

## Images in Articles
- Images stored in same directory as `.md` (同级目录), referenced via relative `./filename.ext`
- Filenames: semantic kebab-case (e.g. `cnn-max-pooling.png`)
- Alt text required, describing content in Chinese
- Source: CC-licensed images from Wikimedia Commons; download via `curl -sL -o <local-path> <wikimedia-url>`
- Find correct hash path from page source: `grep -oP '(?<=src=")[^"]*upload\.wikimedia[^"]*<filename>[^"]*'`
- Remove unused old local image files after replacing references

## File Naming (All Files)
- All filenames and directories: semantic kebab-case (lowercase, hyphens, no underscores/spaces)
- Name reflects content topic concisely; avoid generics like `image1.png`, `photo.jpg`, `page1.md`
