import { getLatestArticles } from "@/lib/articles";
import { articlePath, getSiteUrl } from "@/lib/site";

function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const siteUrl = getSiteUrl();
  const articles = await getLatestArticles(50);

  const items = articles
    .map((article) => {
      const link = `${siteUrl}${articlePath(article.slug)}`;
      const pubDate = article.publishedAt
        ? new Date(article.publishedAt).toUTCString()
        : new Date().toUTCString();

      return `\n      <item>\n        <title>${escapeXml(article.title)}</title>\n        <link>${escapeXml(link)}</link>\n        <guid>${escapeXml(link)}</guid>\n        <pubDate>${escapeXml(pubDate)}</pubDate>\n        <description>${escapeXml(article.excerpt)}</description>\n      </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>Chang Wei Blog</title>\n    <link>${escapeXml(siteUrl)}</link>\n    <description>Chang Wei Blog</description>${items}\n  </channel>\n</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
