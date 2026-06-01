const zhMediumDateFormatter = new Intl.DateTimeFormat("zh-CN", {
  dateStyle: "medium",
});

const zhMediumDateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const zhFullDateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  dateStyle: "full",
  timeStyle: "short",
});

function parseDate(input?: string): Date | undefined {
  if (!input) {
    return undefined;
  }

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed;
}

export function formatZhDate(input?: string): string {
  const parsed = parseDate(input);
  return parsed ? zhMediumDateFormatter.format(parsed) : "";
}

export function formatZhDateTime(input?: string): string {
  const parsed = parseDate(input);
  return parsed ? zhMediumDateTimeFormatter.format(parsed) : "";
}

export function formatZhFullDateTime(input?: string): string {
  const parsed = parseDate(input);
  return parsed ? zhFullDateTimeFormatter.format(parsed) : "";
}