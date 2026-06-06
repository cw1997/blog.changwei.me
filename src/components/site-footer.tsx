import { Copyright } from "lucide-react";

interface SiteFooterProps {
  // no props
}

const YEAR = new Date().getFullYear();

const footerLinks = [
  { href: "https://nextjs.org", label: "Next.js" },
  { href: "https://vercel.com", label: "Vercel" },
];

export function SiteFooter(props: Readonly<SiteFooterProps>) {
  return (
    <footer className="border-t border-zinc-100 dark:border-zinc-800">
      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        <div className="flex flex-col gap-3 text-sm text-zinc-400 dark:text-zinc-500">
          <p className="flex items-center gap-1.5">
            <Copyright className="h-3.5 w-3.5" aria-hidden="true" />
            {YEAR} 昌维 (Chang Wei). All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            <span>Powered by</span>
            {footerLinks.map((link, index) => (
              <span key={link.href} className="flex items-center gap-1.5">
                {index > 0 && <span className="text-zinc-300 dark:text-zinc-600">·</span>}
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-zinc-500 transition hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  {link.label}
                </a>
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
