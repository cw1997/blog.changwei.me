"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArticleImageLightbox } from "@/components/article-image-lightbox";

const DRAG_THRESHOLD = 5;
const COPY_FEEDBACK_MS = 1500;

const COPY_ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
const CHECK_ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
const LINK_ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';

function createHeadingActionButton(label: string, iconSvg: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "md-heading-action-btn";
  button.setAttribute("aria-label", label);
  button.title = label;
  button.innerHTML = iconSvg;
  return button;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function showCopyFeedback(button: HTMLButtonElement, originalIcon: string): void {
  button.innerHTML = CHECK_ICON_SVG;
  window.setTimeout(() => {
    button.innerHTML = originalIcon;
  }, COPY_FEEDBACK_MS);
}

type ScrollState = {
  isDragging: boolean;
  moved: boolean;
  startX: number;
  scrollLeft: number;
};

interface ArticleContentEnhancerProps {
  children: ReactNode;
}

export function ArticleContentEnhancer(props: Readonly<ArticleContentEnhancerProps>) {
  const { children } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<{
    images: { src: string; alt: string }[];
    index: number;
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const setupCleanups: Array<() => void> = [];
    const headingCleanups: Array<() => void> = [];
    const scrollStates = new WeakMap<HTMLElement, ScrollState>();

    const setupScrollContainer = (scrollEl: HTMLElement) => {
      const canScroll = scrollEl.scrollWidth > scrollEl.clientWidth + 1;
      scrollEl.style.cursor = canScroll ? "grab" : "default";

      scrollStates.set(scrollEl, {
        isDragging: false,
        moved: false,
        startX: 0,
        scrollLeft: 0,
      });

      const onPointerDown = (event: PointerEvent) => {
        if (event.button !== 0 || scrollEl.scrollWidth <= scrollEl.clientWidth + 1) {
          return;
        }

        const state = scrollStates.get(scrollEl);
        if (!state) {
          return;
        }

        state.isDragging = true;
        state.moved = false;
        state.startX = event.clientX;
        state.scrollLeft = scrollEl.scrollLeft;
        scrollEl.setPointerCapture(event.pointerId);
        scrollEl.style.cursor = "grabbing";
      };

      const onPointerMove = (event: PointerEvent) => {
        const state = scrollStates.get(scrollEl);
        if (!state?.isDragging) {
          return;
        }

        const deltaX = event.clientX - state.startX;
        if (Math.abs(deltaX) > DRAG_THRESHOLD) {
          state.moved = true;
        }

        scrollEl.scrollLeft = state.scrollLeft - deltaX;
      };

      const finishDrag = (event: PointerEvent) => {
        const state = scrollStates.get(scrollEl);
        if (!state?.isDragging) {
          return;
        }

        state.isDragging = false;
        scrollEl.releasePointerCapture(event.pointerId);
        scrollEl.style.cursor = scrollEl.scrollWidth > scrollEl.clientWidth + 1 ? "grab" : "default";
      };

      scrollEl.addEventListener("pointerdown", onPointerDown);
      scrollEl.addEventListener("pointermove", onPointerMove);
      scrollEl.addEventListener("pointerup", finishDrag);
      scrollEl.addEventListener("pointercancel", finishDrag);

      setupCleanups.push(() => {
        scrollEl.removeEventListener("pointerdown", onPointerDown);
        scrollEl.removeEventListener("pointermove", onPointerMove);
        scrollEl.removeEventListener("pointerup", finishDrag);
        scrollEl.removeEventListener("pointercancel", finishDrag);
      });
    };

    const setupZoomImage = (img: HTMLImageElement) => {
      const onClick = (event: MouseEvent) => {
        const scrollEl = img.closest("[data-md-image-scroll]");
        if (scrollEl instanceof HTMLElement) {
          const state = scrollStates.get(scrollEl);
          if (state?.moved) {
            state.moved = false;
            event.preventDefault();
            return;
          }
        }

        const allImages = container.querySelectorAll<HTMLImageElement>("[data-md-image-zoom]");
        const images = Array.from(allImages).map((element) => ({
          src: element.currentSrc || element.src,
          alt: element.alt || "",
        }));
        const activeIndex = Math.max(0, Array.from(allImages).indexOf(img));
        setLightbox({ images, index: activeIndex });
      };

      img.addEventListener("click", onClick);
      setupCleanups.push(() => img.removeEventListener("click", onClick));
    };

    const setupHeadings = () => {
      headingCleanups.splice(0, headingCleanups.length).forEach((cleanup) => cleanup());

      const markdownBody = container.querySelector(".markdown-body");
      if (!markdownBody) {
        return;
      }

      markdownBody.querySelectorAll<HTMLHeadingElement>("h2, h3, h4, h5, h6").forEach((heading) => {
        if (heading.parentElement?.classList.contains("md-heading-group") || !heading.id) {
          return;
        }

        const wrapper = document.createElement("div");
        wrapper.className = "md-heading-group";
        const parent = heading.parentNode;
        if (!parent) {
          return;
        }

        parent.insertBefore(wrapper, heading);
        wrapper.appendChild(heading);

        const actions = document.createElement("div");
        actions.className = "md-heading-actions";

        const copyButton = createHeadingActionButton("复制标题", COPY_ICON_SVG);
        const anchorButton = createHeadingActionButton("复制锚点链接", LINK_ICON_SVG);

        const onCopyTitle = async () => {
          const text = heading.textContent?.trim() ?? "";
          if (!text) {
            return;
          }

          const success = await copyToClipboard(text);
          if (success) {
            showCopyFeedback(copyButton, COPY_ICON_SVG);
          }
        };

        const onCopyAnchor = async () => {
          const anchorUrl = `${window.location.origin}${window.location.pathname}#${heading.id}`;
          const success = await copyToClipboard(anchorUrl);
          if (success) {
            showCopyFeedback(anchorButton, LINK_ICON_SVG);
          }
        };

        copyButton.addEventListener("click", onCopyTitle);
        anchorButton.addEventListener("click", onCopyAnchor);

        actions.appendChild(copyButton);
        actions.appendChild(anchorButton);
        wrapper.appendChild(actions);

        headingCleanups.push(() => {
          copyButton.removeEventListener("click", onCopyTitle);
          anchorButton.removeEventListener("click", onCopyAnchor);

          if (wrapper.parentNode) {
            wrapper.parentNode.insertBefore(heading, wrapper);
            wrapper.remove();
          }
        });
      });
    };

    const setup = () => {
      setupCleanups.splice(0, setupCleanups.length).forEach((cleanup) => cleanup());

      container.querySelectorAll<HTMLElement>("[data-md-image-scroll]").forEach(setupScrollContainer);
      container.querySelectorAll<HTMLImageElement>("[data-md-image-zoom]").forEach(setupZoomImage);
      setupHeadings();
    };

    setup();

    const loadCleanups: Array<() => void> = [];
    container.querySelectorAll("img").forEach((img) => {
      if (!img.complete) {
        img.addEventListener("load", setup, { once: true });
        loadCleanups.push(() => img.removeEventListener("load", setup));
      }
    });

    const resizeObserver = new ResizeObserver(setup);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      loadCleanups.forEach((cleanup) => cleanup());
      setupCleanups.forEach((cleanup) => cleanup());
      headingCleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return (
    <>
      <div ref={containerRef}>{children}</div>
      <ArticleImageLightbox
        images={lightbox?.images ?? []}
        index={lightbox?.index ?? 0}
        open={lightbox !== null}
        onClose={() => setLightbox(null)}
      />
    </>
  );
}
