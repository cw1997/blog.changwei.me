# Project Rules

## Page Conventions
- Every `page.tsx` uses Server/Client Split: server component does data fetching, client component renders via props
  ```tsx
  // page.tsx — SERVER COMPONENT
  import { NamePage } from "./NamePage";
  import type { PageProps } from "@/types/page";
  export default async function NamePageServer(props: PageProps<"/route">) {
    return <NamePage data={...} />;
  }
  ```
- Server: async, data fetching, `params`/`searchParams` (both `Promise`, must `await`), `redirect()`, `generateMetadata`, SEO
- Client: `"{Name}Page"` from `"./{Name}Page.tsx"`, receives data via props (never async)
- `"use client"` only for interactivity/state/browser APIs
- Page name = path segments as PascalCase; skip route groups, dynamic params `[...]`, `page.tsx`
- Use `PageProps<"/route/path">` from `@/types/page`; `params`/`searchParams` are `Promise`

## Layout Conventions
- Every `layout.tsx` uses `LayoutProps<"/route">` from `@/types/page`
- `params` is `Promise`, `children` is `React.ReactNode`
- Root layout (`app/layout.tsx`) — plain `{ children: React.ReactNode }` (no route params)

## Named Exports
- All `.tsx` files use named exports (`export function` / `export const`)
- Exceptions (framework): `page.tsx`, `layout.tsx`, `error.tsx`, `loading.tsx`, `*.stories.tsx`

## Component Conventions
- **Props**: dedicated `{Name}Props` interface, signature `props: Readonly<{Name}Props>`, destructure as first statement(s)
- **Name**: matches filename stem (PascalCase)
- **React Compiler**: no manual `useMemo`/`useCallback`/`React.memo` unless profiled

## TypeScript
- `strict: true`, `PageProps<T>` / `LayoutProps<T>` from `@/types/page`, avoid `any` (use `unknown`)
