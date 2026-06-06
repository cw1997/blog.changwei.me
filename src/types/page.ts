import type { ReactNode } from "react";

export interface PageProps<TRoute extends string = string> {
  params?: Promise<Record<string, string | string[] | undefined>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export interface LayoutProps<TRoute extends string = string> {
  params?: Promise<Record<string, string | string[] | undefined>>;
  children: ReactNode;
}
