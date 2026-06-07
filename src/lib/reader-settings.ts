export type TextSize = "small" | "medium" | "large";
export type FontFamily = "sans" | "serif";
export type ContentWidth = "narrow" | "standard" | "wide" | "full";
export type LineSpacing = "compact" | "standard" | "relaxed";

export interface ReaderSettings {
  textSize: TextSize;
  fontFamily: FontFamily;
  contentWidth: ContentWidth;
  lineSpacing: LineSpacing;
}

export const READER_SETTINGS_DEFAULTS: ReaderSettings = {
  textSize: "medium",
  fontFamily: "sans",
  contentWidth: "standard",
  lineSpacing: "standard",
};

export const READER_SETTINGS_STORAGE_KEY = "reader-settings";

const TEXT_SIZES: TextSize[] = ["small", "medium", "large"];
const FONT_FAMILIES: FontFamily[] = ["sans", "serif"];
const CONTENT_WIDTHS: ContentWidth[] = ["narrow", "standard", "wide", "full"];
const LINE_SPACINGS: LineSpacing[] = ["compact", "standard", "relaxed"];

function isTextSize(value: unknown): value is TextSize {
  return typeof value === "string" && TEXT_SIZES.includes(value as TextSize);
}

function isFontFamily(value: unknown): value is FontFamily {
  return typeof value === "string" && FONT_FAMILIES.includes(value as FontFamily);
}

function isContentWidth(value: unknown): value is ContentWidth {
  return typeof value === "string" && CONTENT_WIDTHS.includes(value as ContentWidth);
}

function isLineSpacing(value: unknown): value is LineSpacing {
  return typeof value === "string" && LINE_SPACINGS.includes(value as LineSpacing);
}

export function applyReaderSettings(settings: ReaderSettings): void {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.setAttribute("data-text-size", settings.textSize);
  document.documentElement.setAttribute("data-font-family", settings.fontFamily);
  document.documentElement.setAttribute("data-content-width", settings.contentWidth);
  document.documentElement.setAttribute("data-line-spacing", settings.lineSpacing);
}

export function readStoredReaderSettings(): ReaderSettings {
  if (typeof window === "undefined") {
    return READER_SETTINGS_DEFAULTS;
  }

  try {
    const raw = localStorage.getItem(READER_SETTINGS_STORAGE_KEY);
    if (!raw) {
      return READER_SETTINGS_DEFAULTS;
    }

    const parsed = JSON.parse(raw) as Partial<ReaderSettings>;
    return {
      textSize: isTextSize(parsed.textSize) ? parsed.textSize : READER_SETTINGS_DEFAULTS.textSize,
      fontFamily: isFontFamily(parsed.fontFamily) ? parsed.fontFamily : READER_SETTINGS_DEFAULTS.fontFamily,
      contentWidth: isContentWidth(parsed.contentWidth) ? parsed.contentWidth : READER_SETTINGS_DEFAULTS.contentWidth,
      lineSpacing: isLineSpacing(parsed.lineSpacing) ? parsed.lineSpacing : READER_SETTINGS_DEFAULTS.lineSpacing,
    };
  } catch {
    return READER_SETTINGS_DEFAULTS;
  }
}

export function persistReaderSettings(settings: ReaderSettings): void {
  localStorage.setItem(READER_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  applyReaderSettings(settings);
}
