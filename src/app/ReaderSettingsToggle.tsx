"use client";

import { Type } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  applyReaderSettings,
  persistReaderSettings,
  readStoredReaderSettings,
  type ContentWidth,
  type FontFamily,
  type LineSpacing,
  type ReaderSettings,
  type TextSize,
} from "@/lib/reader-settings";

interface ReaderSettingsToggleProps {
  // no props
}

interface SettingOption<T extends string> {
  value: T;
  label: string;
}

const textSizeOptions: SettingOption<TextSize>[] = [
  { value: "small", label: "小" },
  { value: "medium", label: "中" },
  { value: "large", label: "大" },
];

const fontFamilyOptions: SettingOption<FontFamily>[] = [
  { value: "sans", label: "无衬线" },
  { value: "serif", label: "衬线" },
];

const lineSpacingOptions: SettingOption<LineSpacing>[] = [
  { value: "compact", label: "密集" },
  { value: "standard", label: "标准" },
  { value: "relaxed", label: "宽松" },
];

const contentWidthOptions: SettingOption<ContentWidth>[] = [
  { value: "narrow", label: "窄" },
  { value: "standard", label: "标准" },
  { value: "wide", label: "宽" },
  { value: "full", label: "全宽" },
];

const iconButtonClassName =
  "inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100";

const optionButtonClassName =
  "rounded-md px-2.5 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600";

function getSelectedOptionClassName(isSelected: boolean): string {
  return isSelected
    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100";
}

interface SettingGroupProps<T extends string> {
  label: string;
  value: T;
  options: SettingOption<T>[];
  onChange: (value: T) => void;
}

function SettingGroup<T extends string>(props: Readonly<SettingGroupProps<T>>) {
  const { label, value, options, onChange } = props;

  return (
    <div role="group" aria-label={label} className="space-y-1.5">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
      <div className="flex flex-wrap gap-1">
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(option.value)}
              className={`${optionButtonClassName} ${getSelectedOptionClassName(isSelected)}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ReaderSettingsToggle(props: Readonly<ReaderSettingsToggleProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    const stored = readStoredReaderSettings();
    applyReaderSettings(stored);
    return stored;
  });
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const updateSettings = <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => {
    const nextSettings = { ...settings, [key]: value };
    setSettings(nextSettings);
    persistReaderSettings(nextSettings);
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={iconButtonClassName}
        aria-label="文本设置"
        aria-expanded={isOpen}
        title="文本设置"
      >
        <Type className="h-4 w-4" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div
          role="tooltip"
          className="absolute right-0 top-full z-40 mt-2 w-[min(18rem,calc(100vw-2rem))] space-y-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">阅读设置</p>
          <SettingGroup
            label="字号"
            value={settings.textSize}
            options={textSizeOptions}
            onChange={(value) => updateSettings("textSize", value)}
          />
          <SettingGroup
            label="行距"
            value={settings.lineSpacing}
            options={lineSpacingOptions}
            onChange={(value) => updateSettings("lineSpacing", value)}
          />
          <SettingGroup
            label="字体"
            value={settings.fontFamily}
            options={fontFamilyOptions}
            onChange={(value) => updateSettings("fontFamily", value)}
          />
          <SettingGroup
            label="宽度"
            value={settings.contentWidth}
            options={contentWidthOptions}
            onChange={(value) => updateSettings("contentWidth", value)}
          />
        </div>
      ) : null}
    </div>
  );
}
