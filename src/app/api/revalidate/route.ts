import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

function isAuthorized(request: Request): boolean {
  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret");
  const headerSecret = request.headers.get("x-revalidate-secret");
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected) {
    return false;
  }

  return querySecret === expected || headerSecret === expected;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  revalidateTag("articles", "max");
  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath("/tags");
  revalidatePath("/rss.xml");

  return NextResponse.json({
    ok: true,
    now: new Date().toISOString(),
    message: "Revalidation triggered",
  });
}

export async function GET(request: Request) {
  return POST(request);
}
