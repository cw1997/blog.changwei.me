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

## TypeScript
- `strict: true`; `PageProps<T>` / `LayoutProps<T>` from `@/types/page`; avoid `any` (use `unknown`)
