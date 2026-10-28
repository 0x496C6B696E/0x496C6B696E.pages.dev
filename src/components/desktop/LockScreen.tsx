"use client";

import { Power } from "lucide-react";
import { site } from "@/config/site";
import { useExperience, type Mode } from "@/components/experience/ExperienceProvider";
import { cn } from "@/lib/cn";

interface Props {
  onEnter: (mode?: Mode) => void;
  /** Whether the client has mounted; before that the button only renders, it cannot act. */
  ready: boolean;
  /** True while the lock screen fades into the boot sequence. */
  leaving: boolean;
}

/**
 * The locked machine. The layer lets pointer events through to the 3D room (the tower's power
 * button and the monitor are clickable); only the buttons catch them.
 */
export function LockScreen({ onEnter, ready, leaving }: Props) {
  const { hint } = useExperience();
  return (
    <div
      className={cn("safe-x safe-b pointer-events-none relative flex min-h-dvh flex-col items-center justify-center px-6 pt-16 pb-24 text-center", leaving && "fade-out")}
      aria-busy={leaving}
    >
      <p className="mb-6 text-xs font-medium text-accent">
        {site.system.toLowerCase()} v{site.version} · locked
      </p>
      <h1 className="display text-glow text-[2.4rem] leading-none font-bold text-ink sm:text-6xl md:text-7xl">{site.name}</h1>
      <p className="mt-4 text-sm font-medium text-accent sm:text-base">{site.identity}</p>
      <p className="mt-6 max-w-md text-base text-ash sm:text-lg">
        {site.developer.title}. {site.tagline}
      </p>

      <button type="button" className="btn btn-primary pointer-events-auto mt-12 min-h-13 px-9 text-[0.95rem]" onClick={() => onEnter()} disabled={!ready || leaving} data-testid="enter">
        <Power className="size-4" aria-hidden="true" />
        Power on
      </button>
      <button type="button" className="btn btn-ghost btn-sm pointer-events-auto mt-4" onClick={() => onEnter("explorer")} disabled={!ready || leaving}>
        Skip boot · Explorer mode
      </button>

      <p className="absolute right-0 bottom-6 left-0 hidden text-xs text-dust sm:block" aria-live="polite">
        {hint ? (
          <span className="hint-chip">{hint}</span>
        ) : (
          <>
            <kbd className="kbd">Enter</kbd> powers on · <kbd className="kbd">Esc</kbd> skips the boot · the power button on the tower and the monitor are clickable too
          </>
        )}
      </p>
    </div>
  );
}
