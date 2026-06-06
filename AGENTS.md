# Project Rules

## Page Conventions
- Every `page.tsx`: Server/Client split — server fetches data, client `{Name}Page` renders via props
  ```tsx
  import { NamePage } from "./NamePage";
  import type { PageProps } from "@/types/page";
  export default async function NamePageServer(props: PageProps<"/route">) {
    return <NamePage data={...} />;
  }
  ```
- Server: async, data fetching, `params`/`searchParams` (both `Promise`, must `await`), `redirect()`, `generateMetadata`, SEO
- Client: `"{Name}Page"` from `"./{Name}Page.tsx"`, props only (never async); `"use client"` only for interactivity/state/browser APIs
- Page name = path segments as PascalCase; skip route groups, dynamic params `[...]`, `page.tsx`
- Use `PageProps<"/route/path">` from `@/types/page`

## Layout Conventions
- Every `layout.tsx` uses `LayoutProps<"/route">` from `@/types/page`; `params` is `Promise`, `children` is `React.ReactNode`
- Root layout (`app/layout.tsx`): plain `{ children: React.ReactNode }` (no route params)

## Named Exports
- All `.tsx` files use named exports (`export function` / `export const`)
- Exceptions (framework): `page.tsx`, `layout.tsx`, `error.tsx`, `loading.tsx`, `*.stories.tsx`

## Component Conventions
- **Props**: dedicated `{Name}Props` interface, signature `props: Readonly<{Name}Props>`, destructure as first statement(s)
- **Name**: matches filename stem (PascalCase)
- **React Compiler**: no manual `useMemo`/`useCallback`/`React.memo` unless profiled

## TypeScript
- `strict: true`, `PageProps<T>` / `LayoutProps<T>` from `@/types/page`, avoid `any` (use `unknown`)
