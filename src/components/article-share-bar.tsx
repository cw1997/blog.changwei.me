"use client";

import { Check, Link2, QrCode, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";

const COPY_FEEDBACK_MS = 5000;

interface ArticleShareBarProps {
  permalink: string;
  title: string;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function ArticleShareBar(props: Readonly<ArticleShareBarProps>) {
  const { permalink, title } = props;
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const copiedTimerRef = useRef<number | null>(null);

  const showCopiedFeedback = () => {
    if (copiedTimerRef.current !== null) {
      window.clearTimeout(copiedTimerRef.current);
    }

    setCopied(true);
    copiedTimerRef.current = window.setTimeout(() => {
      setCopied(false);
      copiedTimerRef.current = null;
    }, COPY_FEEDBACK_MS);
  };

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current !== null) {
        window.clearTimeout(copiedTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!qrOpen) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (qrRef.current && !qrRef.current.contains(event.target as Node)) {
        setQrOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setQrOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [qrOpen]);

  const onCopyPermalink = async () => {
    const success = await copyText(permalink);
    if (success) {
      showCopiedFeedback();
    }
  };

  const onShare = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url: permalink });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    const success = await copyText(permalink);
    if (success) {
      showCopiedFeedback();
    }
  };

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-900/60">
      <div className="inline-flex min-w-0 max-w-full flex-wrap items-center gap-2">
        <span className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">永久链接：</span>
        <button
          type="button"
          onClick={onCopyPermalink}
          className="inline-flex min-w-0 max-w-full items-center gap-2 text-left text-sm text-zinc-600 transition hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:text-zinc-400 dark:hover:text-green-400"
          title="点击复制永久链接"
          aria-label="复制文章永久链接"
        >
          <Link2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{permalink}</span>
        </button>
        {copied ? (
          <span
            className="inline-flex shrink-0 items-center gap-1 text-sm text-green-600 dark:text-green-400"
            aria-live="polite"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            已复制
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-1">
        <div className="relative" ref={qrRef}>
          <button
            type="button"
            onClick={() => setQrOpen((value) => !value)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition hover:bg-white hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            aria-label="显示二维码"
            aria-expanded={qrOpen}
          >
            <QrCode className="h-4 w-4" aria-hidden="true" />
          </button>

          {qrOpen ? (
            <div
              role="tooltip"
              className="absolute right-0 top-full z-20 mt-2 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
            >
              <QRCode value={permalink} size={128} className="h-32 w-32" />
              <p className="mt-2 max-w-[8rem] text-center text-xs text-zinc-500 dark:text-zinc-400">扫码打开文章</p>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onShare}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition hover:bg-white hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          aria-label="分享文章"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
