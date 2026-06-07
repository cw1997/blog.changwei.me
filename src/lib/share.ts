export type SharePlatformId =
  | "facebook"
  | "twitter"
  | "weibo"
  | "qq"
  | "wechat"
  | "linkedin"
  | "telegram"
  | "whatsapp"
  | "reddit"
  | "email";

export interface SharePlatform {
  id: SharePlatformId;
  label: string;
  href?: string;
  hint?: string;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function openShareUrl(href: string): void {
  window.open(href, "_blank", "noopener,noreferrer");
}

interface BuildShareLinksParams {
  url: string;
  title: string;
  summary?: string;
}

export function buildShareLinks(params: Readonly<BuildShareLinksParams>): SharePlatform[] {
  const { url, title, summary = "" } = params;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedSummary = encodeURIComponent(summary);

  return [
    {
      id: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      id: "twitter",
      label: "Twitter",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      id: "weibo",
      label: "微博",
      href: `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedTitle}`,
    },
    {
      id: "qq",
      label: "QQ",
      href: `https://connect.qq.com/widget/shareqq/index.html?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedSummary}`,
    },
    {
      id: "wechat",
      label: "微信",
      hint: "请使用上方二维码，微信扫一扫分享",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      id: "telegram",
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    },
    {
      id: "reddit",
      label: "Reddit",
      href: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    },
    {
      id: "email",
      label: "邮件",
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
    },
  ];
}
