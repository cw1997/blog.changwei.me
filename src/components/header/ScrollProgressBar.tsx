"use client";

import { useEffect, useState } from "react";

interface ScrollProgressBarProps {
  // no props
}

function getScrollProgress(): number {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollableHeight <= 0) {
    return 0;
  }

  return Math.min(100, (window.scrollY / scrollableHeight) * 100);
}

export function ScrollProgressBar(props: Readonly<ScrollProgressBarProps>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setProgress(getScrollProgress());
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className="scroll-progress-bar absolute bottom-0 left-0 h-0.5 bg-green-600 dark:bg-green-400"
      style={{ width: `${progress}%` }}
      aria-hidden="true"
    />
  );
}
