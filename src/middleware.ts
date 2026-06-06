import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const IMAGE_PATH = /^\/articles\/(.+\.(?:png|jpe?g|gif|webp|svg))$/i;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const imageMatch = pathname.match(IMAGE_PATH);
  if (imageMatch) {
    return NextResponse.rewrite(new URL(`/api/article-media/${imageMatch[1]}`, request.url));
  }

  if (pathname.startsWith("/article-assets/")) {
    const rest = pathname.slice("/article-assets/".length);
    return NextResponse.redirect(new URL(`/articles/${rest}`, request.url), 301);
  }
}

export const config = {
  matcher: ["/articles/:path*", "/article-assets/:path*"],
};
