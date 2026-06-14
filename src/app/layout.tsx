import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_SC } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { SiteHeader } from "@/components/header/SiteHeader";
import { defaultLocale, getSiteUrl, siteDescription, siteName } from "@/lib/site";
import "@/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerifSc = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: ["博客", "技术文章", "Chang Wei"],
  openGraph: {
    type: "website",
    locale: defaultLocale,
    siteName,
    title: siteName,
    description: siteDescription,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
};

const appInitScript = `(() => {
  try {
    const storedTheme = localStorage.getItem("theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : (systemDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  } catch {
    document.documentElement.setAttribute("data-theme", "light");
  }

  try {
    const defaults = { textSize: "medium", fontFamily: "sans", contentWidth: "standard", lineSpacing: "standard" };
    const raw = localStorage.getItem("reader-settings");
    const parsed = raw ? JSON.parse(raw) : {};
    const textSizes = ["small", "medium", "large"];
    const fontFamilies = ["sans", "serif"];
    const contentWidths = ["narrow", "standard", "wide", "full"];
    const lineSpacings = ["compact", "standard", "relaxed"];
    const textSize = textSizes.includes(parsed.textSize) ? parsed.textSize : defaults.textSize;
    const fontFamily = fontFamilies.includes(parsed.fontFamily) ? parsed.fontFamily : defaults.fontFamily;
    const contentWidth = contentWidths.includes(parsed.contentWidth) ? parsed.contentWidth : defaults.contentWidth;
    const lineSpacing = lineSpacings.includes(parsed.lineSpacing) ? parsed.lineSpacing : defaults.lineSpacing;
    document.documentElement.setAttribute("data-text-size", textSize);
    document.documentElement.setAttribute("data-font-family", fontFamily);
    document.documentElement.setAttribute("data-content-width", contentWidth);
    document.documentElement.setAttribute("data-line-spacing", lineSpacing);
  } catch {
    document.documentElement.setAttribute("data-text-size", "medium");
    document.documentElement.setAttribute("data-font-family", "sans");
    document.documentElement.setAttribute("data-content-width", "standard");
    document.documentElement.setAttribute("data-line-spacing", "standard");
  }
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${notoSerifSc.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: appInitScript }} />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0MNNL1G7M3"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-0MNNL1G7M3');`}
        </Script>
      </head>
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-zinc-900 focus:shadow focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:bg-zinc-900 dark:focus:text-zinc-100"
        >
          跳转到主要内容
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
