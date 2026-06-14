# Project Rules

## Pages (`page.tsx`)
- Server/Client split: server fetches data; client `{Name}Page` renders via props only
- Server: async — data, `await params`/`searchParams` (both `Promise`), `redirect()`, `generateMetadata`, SEO
- Client: `"./{Name}Page.tsx"`, props only (never async); `"use client"` only for interactivity/state/browser APIs
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
- Root layout: plain `{ children: React.ReactNode }` (no route params)

## Exports
- Named exports (`export function` / `export const`) in all `.tsx`
- Exceptions: `page.tsx`, `layout.tsx`, `error.tsx`, `loading.tsx`, `*.stories.tsx`

## Components
- Props: `{Name}Props` interface, `props: Readonly<{Name}Props>`, destructure first
- Name matches filename stem (PascalCase)
- No manual `useMemo`/`useCallback`/`React.memo` unless profiled (React Compiler)
- Colocation: components referenced by only one caller live in the caller's directory; extract to `@/components/` only when referenced by 2+ callers or the caller is a `page.tsx`/`layout.tsx`
- Single-reference components: place in the same directory as the only caller, not in a shared directory (只被一个地方引用的组件放在调用方同级目录下，不放入共享目录)
- Components referenced by only one caller go in the same directory as that caller (colocated), not in a shared folder
- Colocation rule: a component referenced by only one caller lives in the same directory as that caller (no shared directory extraction until a second consumer exists)
- Components referenced by only one caller: co-locate in the caller's directory (同级目录)
- Components referenced only once are colocated with their sole caller in the same directory (不为仅被引用一次的组件创建单独目录；将其 `.tsx` 文件放在调用方同级目录下)
- **Colocation**: components referenced by only one caller are placed in the caller's directory, not in a shared location
- Colocation: a component referenced by only one caller lives in the same directory as that caller; only promote to `@/components/` when shared by 2+ callers
- Components referenced by only one caller live in that caller's directory (同级目录); shared components live in a shared ancestor (e.g. `_components/`)
- **Single-reference colocation**: a component referenced by only one other component lives in the same directory as its sole consumer (sibling, not nested)

## TypeScript
- `strict: true`; `PageProps<T>` / `LayoutProps<T>` from `@/types/page`; avoid `any` (use `unknown`)

## Images in Articles
- All article images are stored in the same directory as the `.md` file (同级目录), referenced via relative paths `./filename.ext`
- Image filenames use semantic kebab-case names (e.g. `cnn-max-pooling.png`, `ai-ml-dl-venn-diagram.png`)
- Alt text is required and describes the image content in Chinese
- Source: CC-licensed images from Wikimedia Commons; download with `curl -sL -o <local-path> <wikimedia-url>`
- When adding images, find correct Wikimedia Commons hash path (extract from page source `grep -oP '(?<=src=")[^"]*upload\.wikimedia[^"]*<filename>[^"]*'`)
- Remove unused old local image files after replacing references
