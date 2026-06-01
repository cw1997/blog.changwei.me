"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import ArticleImageLightbox from "@/components/article-image-lightbox";

const DRAG_THRESHOLD = 5;

type ScrollState = {
  isDragging: boolean;
  moved: boolean;
  startX: number;
  scrollLeft: number;
};

export default function ArticleContentEnhancer({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const setupCleanups: Array<() => void> = [];
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

        setLightbox({ src: img.currentSrc || img.src, alt: img.alt || "" });
      };

      img.addEventListener("click", onClick);
      setupCleanups.push(() => img.removeEventListener("click", onClick));
    };

    const setup = () => {
      setupCleanups.splice(0, setupCleanups.length).forEach((cleanup) => cleanup());

      container.querySelectorAll<HTMLElement>("[data-md-image-scroll]").forEach(setupScrollContainer);
      container.querySelectorAll<HTMLImageElement>("[data-md-image-zoom]").forEach(setupZoomImage);
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
    };
  }, []);

  return (
    <>
      <div ref={containerRef}>{children}</div>
      <ArticleImageLightbox
        src={lightbox?.src ?? ""}
        alt={lightbox?.alt ?? ""}
        open={lightbox !== null}
        onClose={() => setLightbox(null)}
      />
    </>
  );
}
