"use client";

import { useId, useRef } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  ariaLabelPrev?: string;
  ariaLabelNext?: string;
};

export function HorizontalScroller({
  children,
  className = "",
  ariaLabelPrev = "Previous",
  ariaLabelNext = "Next",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  function scrollByDir(dir: 1 | -1) {
    const el = ref.current;
    if (!el) return;
    const amount = Math.min(320, Math.max(200, el.clientWidth * 0.55));
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        aria-controls={id}
        aria-label={ariaLabelPrev}
        onClick={() => scrollByDir(-1)}
        className="absolute start-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-mm-line bg-mm-surface/95 text-lg text-mm-primary shadow-sm transition-colors hover:bg-mm-soft md:flex"
      >
        ‹
      </button>
      <button
        type="button"
        aria-controls={id}
        aria-label={ariaLabelNext}
        onClick={() => scrollByDir(1)}
        className="absolute end-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-mm-line bg-mm-surface/95 text-lg text-mm-primary shadow-sm transition-colors hover:bg-mm-soft md:flex"
      >
        ›
      </button>
      <div id={id} ref={ref} className="mm-scroller px-1 md:px-12">
        {children}
      </div>
    </div>
  );
}
