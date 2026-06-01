"use client";

import {
  Download,
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PhotoSlider } from "react-photo-view";
import type { OverlayRenderProps, PhotoRenderParams } from "react-photo-view/dist/types";
import "react-photo-view/dist/react-photo-view.css";

const ZOOM_STEP = 0.5;
const MIN_SCALE = 0.1;

export type ArticleImageItem = {
  src: string;
  alt: string;
};

type ArticleImageLightboxProps = {
  images: ArticleImageItem[];
  index: number;
  open: boolean;
  onClose: () => void;
};

function inferDownloadFilename(src: string, alt: string): string {
  if (alt.trim()) {
    const extMatch = src.match(/\.(avif|gif|jpe?g|png|svg|webp)(?:$|\?)/i);
    const ext = extMatch ? extMatch[0].replace(/\?.*$/, "") : ".jpg";
    const safeAlt = alt.trim().replace(/[^\w\u4e00-\u9fff.-]+/g, "_");
    return safeAlt.includes(".") ? safeAlt : `${safeAlt}${ext}`;
  }

  try {
    const pathname = new URL(src, window.location.origin).pathname;
    const basename = pathname.split("/").pop();
    if (basename) {
      return basename;
    }
  } catch {
    // fall through
  }

  return "image.jpg";
}

async function downloadImage(src: string, alt: string) {
  const filename = inferDownloadFilename(src, alt);

  try {
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error("Failed to fetch image");
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(src, "_blank", "noopener,noreferrer");
  }
}

function ToolbarIconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="PhotoView-Slider__toolbarIcon flex items-center justify-center"
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function ArticleImageLightbox({
  images,
  index,
  open,
  onClose,
}: ArticleImageLightboxProps) {
  const [activeIndex, setActiveIndex] = useState(index);
  const [flipX, setFlipX] = useState(1);
  const [flipY, setFlipY] = useState(1);

  useEffect(() => {
    if (open) {
      setActiveIndex(index);
      setFlipX(1);
      setFlipY(1);
    }
  }, [open, index]);

  const resetFlip = () => {
    setFlipX(1);
    setFlipY(1);
  };

  const sliderImages = useMemo(
    () =>
      images.map((item) => ({
        key: item.src,
        src: item.src,
        render: ({ attrs }: PhotoRenderParams) => {
          const baseStyle = (attrs.style ?? {}) as React.CSSProperties;
          const baseTransform = baseStyle.transform ?? "";

          return (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              {...attrs}
              src={item.src}
              alt={item.alt}
              style={{
                ...baseStyle,
                transform: `${baseTransform} scaleX(${flipX}) scaleY(${flipY})`.trim(),
              }}
            />
          );
        },
      })),
    [images, flipX, flipY],
  );

  const renderToolbar = ({
    scale,
    onScale,
    rotate,
    onRotate,
    onClose: closeViewer,
    index: currentIndex,
  }: OverlayRenderProps) => {
    const currentImage = images[currentIndex];

    return (
      <>
        <ToolbarIconButton
          label="放大"
          onClick={() => onScale(scale + ZOOM_STEP)}
        >
          <ZoomIn className="h-5 w-5" strokeWidth={1.75} />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="缩小"
          onClick={() => onScale(Math.max(MIN_SCALE, scale - ZOOM_STEP))}
        >
          <ZoomOut className="h-5 w-5" strokeWidth={1.75} />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="逆时针旋转"
          onClick={() => onRotate(rotate - 90)}
        >
          <RotateCcw className="h-5 w-5" strokeWidth={1.75} />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="顺时针旋转"
          onClick={() => onRotate(rotate + 90)}
        >
          <RotateCw className="h-5 w-5" strokeWidth={1.75} />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="水平翻转"
          onClick={() => setFlipX((value) => (value === 1 ? -1 : 1))}
        >
          <FlipHorizontal className="h-5 w-5" strokeWidth={1.75} />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="垂直翻转"
          onClick={() => setFlipY((value) => (value === 1 ? -1 : 1))}
        >
          <FlipVertical className="h-5 w-5" strokeWidth={1.75} />
        </ToolbarIconButton>
        {currentImage ? (
          <ToolbarIconButton
            label="下载图片"
            onClick={() => downloadImage(currentImage.src, currentImage.alt)}
          >
            <Download className="h-5 w-5" strokeWidth={1.75} />
          </ToolbarIconButton>
        ) : null}
        <ToolbarIconButton label="关闭" onClick={() => closeViewer()}>
          <X className="h-5 w-5" strokeWidth={1.75} />
        </ToolbarIconButton>
      </>
    );
  };

  const renderOverlay = ({ index: currentIndex }: OverlayRenderProps) => {
    const alt = images[currentIndex]?.alt;
    if (!alt) {
      return null;
    }

    return (
      <p className="pointer-events-none absolute inset-x-0 bottom-20 px-6 text-center text-sm leading-relaxed text-white/85">
        {alt}
      </p>
    );
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <PhotoSlider
      images={sliderImages}
      visible={open}
      index={activeIndex}
      onIndexChange={(nextIndex) => {
        setActiveIndex(nextIndex);
        resetFlip();
      }}
      onClose={onClose}
      afterClose={resetFlip}
      maskClosable
      photoClosable={false}
      pullClosable
      bannerVisible
      loop={false}
      maskOpacity={0.92}
      toolbarRender={renderToolbar}
      overlayRender={renderOverlay}
    />
  );
}
