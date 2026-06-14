"use client";

import {
  EmailIcon,
  FacebookIcon,
  LinkedInIcon,
  QQIcon,
  RedditIcon,
  TelegramIcon,
  TwitterIcon,
  WeChatIcon,
  WeiboIcon,
  WhatsAppIcon,
} from "@/components/brand-icons";
import { buildShareLinks, copyText, openShareUrl, type SharePlatform, type SharePlatformId } from "@/lib/share";
import { Check, Link2, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type ComponentType } from "react";
import QRCode from "react-qr-code";

const COPY_FEEDBACK_MS = 5000;

interface ArticleShareDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  excerpt: string;
  permalink: string;
}

const platformIcons: Record<SharePlatformId, ComponentType<{ className?: string }>> = {
  facebook: FacebookIcon,
  twitter: TwitterIcon,
  weibo: WeiboIcon,
  qq: QQIcon,
  wechat: WeChatIcon,
  linkedin: LinkedInIcon,
  telegram: TelegramIcon,
  whatsapp: WhatsAppIcon,
  reddit: RedditIcon,
  email: EmailIcon,
};

function SharePlatformButton(props: Readonly<{ platform: SharePlatform; onWeChatHint: (hint: string) => void }>) {
  const { platform, onWeChatHint } = props;
  const Icon = platformIcons[platform.id];

  const onClick = () => {
    if (platform.hint) {
      onWeChatHint(platform.hint);
      return;
    }

    if (platform.href) {
      openShareUrl(platform.href);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex flex-col items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-2.5 text-xs text-zinc-600 transition hover:border-zinc-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
      aria-label={`分享到 ${platform.label}`}
    >
      <Icon className="h-5 w-5" />
      <span>{platform.label}</span>
    </button>
  );
}

export function ArticleShareDialog(props: Readonly<ArticleShareDialogProps>) {
  const { open, onClose, title, excerpt, permalink } = props;
  const titleId = useId();
  const [copied, setCopied] = useState(false);
  const [weChatHint, setWeChatHint] = useState<string | null>(null);
  const copiedTimerRef = useRef<number | null>(null);
  const shareLinks = buildShareLinks({ url: permalink, title, summary: excerpt });

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
    if (!open) {
      setWeChatHint(null);
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const onCopyPermalink = async () => {
    const success = await copyText(permalink);
    if (success) {
      showCopiedFeedback();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="关闭分享对话框"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(90vh,40rem)] w-full max-w-md flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-950"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <h2 id={titleId} className="text-lg font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            aria-label="关闭"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {excerpt.trim() || "暂无摘要"}
          </p>

          <div className="mt-5 flex flex-col items-center">
            <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
              <QRCode value={permalink} size={160} className="h-40 w-40" />
            </div>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">扫码打开文章</p>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">永久链接</p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onCopyPermalink}
                className="inline-flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-sm text-zinc-600 transition hover:border-zinc-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
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
          </div>

          {weChatHint ? (
            <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/50 dark:text-green-400" role="status">
              {weChatHint}
            </p>
          ) : null}

          <div className="mt-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">分享到</p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {shareLinks.map((platform) => (
                <SharePlatformButton
                  key={platform.id}
                  platform={platform}
                  onWeChatHint={setWeChatHint}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
