import type { ComponentType } from "react";
import { Copyright } from "lucide-react";
import { CloudflareIcon, NextJsIcon, VercelIcon } from "@/components/brand-icons";
import { buildInfo } from "@/lib/build-info";

interface SiteFooterProps {
  // no props
}

const YEAR = new Date().getFullYear();

interface FooterLink {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const poweredByLinks: FooterLink[] = [
  { href: "https://nextjs.org", label: "Next.js", icon: NextJsIcon },
  { href: "https://vercel.com", label: "Vercel", icon: VercelIcon },
];

const cdnLink: FooterLink = {
  href: "https://www.cloudflare.com",
  label: "Cloudflare",
  icon: CloudflareIcon,
};

function formatCommitDate(isoDate: string): string {
  if (!isoDate) {
    return "";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoDate));
}

function FooterExternalLink(props: Readonly<FooterLink>) {
  const { href, label, icon: Icon } = props;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 font-medium text-zinc-500 transition hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:text-zinc-400 dark:hover:text-zinc-100"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </a>
  );
}

export function SiteFooter(props: Readonly<SiteFooterProps>) {
  const formattedDate = formatCommitDate(buildInfo.commitDate);
  const commitHref =
    buildInfo.commitSha !== "dev" && buildInfo.commitShaFull
      ? `${buildInfo.repoUrl}/commit/${buildInfo.commitShaFull}`
      : undefined;

  return (
    <footer className="border-t border-zinc-100 dark:border-zinc-800">
      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        <div className="flex flex-col gap-3 text-sm text-zinc-400 dark:text-zinc-500">
          <p className="flex items-center gap-1.5">
            <Copyright className="h-3.5 w-3.5" aria-hidden="true" />
            {YEAR} 昌维 (Chang Wei). All rights reserved.
          </p>
          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <span>Powered by</span>
            {poweredByLinks.map((link, index) => (
              <span key={link.href} className="inline-flex items-center gap-1.5">
                {index > 0 && <span className="text-zinc-300 dark:text-zinc-600">·</span>}
                <FooterExternalLink {...link} />
              </span>
            ))}
            <span className="text-zinc-300 dark:text-zinc-600">·</span>
            <span>CDN by</span>
            <FooterExternalLink {...cdnLink} />
          </p>
          {buildInfo.commitSha !== "dev" && formattedDate ? (
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
              <span>最后更新：{formattedDate}</span>
              <span className="text-zinc-300 dark:text-zinc-600">·</span>
              {commitHref ? (
                <a
                  href={commitHref}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs font-medium text-zinc-500 transition hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  {buildInfo.commitSha}
                </a>
              ) : (
                <span className="font-mono text-xs font-medium text-zinc-500 dark:text-zinc-400">{buildInfo.commitSha}</span>
              )}
            </p>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
