"use client";

import { Power } from "lucide-react";
import { site } from "@/config/site";
import type { Mode } from "@/components/experience/ExperienceProvider";
import { cn } from "@/lib/cn";

interface Props {
  onEnter: (mode?: Mode) => void;
  /** Whether the client has mounted; before that the button only renders, it cannot act. */
  ready: boolean;
  /** True while the room fades to the boot screen. */
  leaving: boolean;
}

export function EntryScreen({ onEnter, ready, leaving }: Props) {
  return (
    <div
      className={cn("safe-x safe-b relative flex min-h-dvh flex-col items-center justify-center px-6 pt-16 pb-24 text-center", leaving && "fade-out")}
      aria-busy={leaving}
    >
      <p className="eyebrow mb-6">
        {site.system} v{site.version} · standby
      </p>
      <h1 className="display text-glow text-[2.3rem] leading-none font-bold tracking-[0.08em] text-ink sm:text-6xl md:text-7xl">{site.name}</h1>
      <p className="display mt-5 text-[0.72rem] tracking-[0.3em] text-gold uppercase sm:text-xs">{site.identity}</p>
      <p className="mt-8 max-w-md font-mono text-sm text-ash sm:text-base">
        {site.developer.title}. {site.tagline}
      </p>

      <button type="button" className="btn btn-primary mt-12 min-h-13 px-9 text-[0.82rem] sm:text-sm" onClick={() => onEnter()} disabled={!ready || leaving} data-testid="enter">
        <Power className="size-4" aria-hidden="true" />
        Power on
      </button>
      <button type="button" className="btn btn-ghost btn-sm mt-4" onClick={() => onEnter("explorer")} disabled={!ready || leaving}>
        Skip boot · Explorer mode
      </button>

      <p className="absolute right-0 bottom-6 left-0 hidden text-xs text-dust sm:block">
        <kbd className="kbd">Enter</kbd> powers on · <kbd className="kbd">Esc</kbd> skips the boot sequence · no WebGL needed for Explorer
      </p>
    </div>
  );
}
