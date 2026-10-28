"use client";

import { site } from "@/config/site";
import type { Mode } from "@/components/experience/ExperienceProvider";
import { cn } from "@/lib/cn";

interface Props {
  onEnter: (mode?: Mode) => void;
  /** Whether the client has mounted; before that the button only renders, it cannot act. */
  ready: boolean;
  /** True while the camp fades out before the kindling transition. */
  leaving: boolean;
}

export function EntryScreen({ onEnter, ready, leaving }: Props) {
  return (
    <div
      className={cn("safe-x safe-b relative flex min-h-dvh flex-col items-center justify-center px-6 pt-16 pb-24 text-center", leaving && "fade-out")}
      aria-busy={leaving}
    >
      <p className="eyebrow mb-7">A forgotten camp · somewhere in the fog</p>
      <h1 className="display text-glow text-[2.6rem] leading-none font-semibold tracking-[0.2em] text-ink sm:text-6xl md:text-7xl">
        {site.name}
      </h1>
      <p className="display mt-5 text-[0.72rem] tracking-[0.34em] text-gold uppercase sm:text-xs">{site.identity}</p>
      <p className="mt-9 max-w-md text-base text-ash italic sm:text-lg">“Rest at the Bonfire.”</p>

      <button
        type="button"
        className="btn btn-primary mt-12 min-h-13 px-9 text-[0.82rem] sm:text-sm"
        onClick={() => onEnter()}
        disabled={!ready || leaving}
        data-testid="enter"
      >
        Enter the Bonfire
      </button>
      <button type="button" className="btn btn-ghost btn-sm mt-4" onClick={() => onEnter("explorer")} disabled={!ready || leaving}>
        Skip the cinematics · Explorer mode
      </button>

      <p className="absolute right-0 bottom-6 left-0 hidden text-xs text-dust sm:block">
        <kbd className="kbd">Enter</kbd> to continue · <kbd className="kbd">Esc</kbd> skips the transition · no WebGL needed for Explorer
      </p>
    </div>
  );
}
