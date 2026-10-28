"use client";

import { useEffect, useMemo, useState } from "react";
import { site } from "@/config/site";
import { BOOT_STEP_MS, bootLines } from "@/lib/boot";

/**
 * HTML boot screen, used when the 3D room is not drawing yet (otherwise the same log is painted
 * on the monitor). It only animates; <Session/> ends the boot on the shared clock.
 */
export function BootSequence() {
  const lines = useMemo(() => bootLines(), []);
  const [shown, setShown] = useState(1);

  useEffect(() => {
    if (shown >= lines.length) return;
    const id = window.setTimeout(() => setShown((n) => n + 1), BOOT_STEP_MS);
    return () => window.clearTimeout(id);
  }, [shown, lines.length]);

  const progress = Math.round((shown / lines.length) * 100);

  return (
    <div className="rise-in flex min-h-dvh flex-col items-center justify-center px-6 text-center" aria-live="polite" data-testid="boot">
      <p className="display text-glow text-3xl font-bold text-ink sm:text-4xl">{site.name}</p>
      <div className="statbar mt-8 w-full max-w-xs" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Boot progress">
        <span style={{ width: `${progress}%`, transitionDuration: "0.25s" }} />
      </div>
      <pre className="mt-6 w-full max-w-md text-left font-mono text-[0.76rem] leading-7 text-dust sm:text-[0.8rem]" aria-label="Boot log">
        {lines.slice(0, shown).map((line, i) => (
          <span key={i} className={i === shown - 1 ? "block text-ink" : "block"}>
            {line}
          </span>
        ))}
      </pre>
      <p className="mt-6 text-xs text-dust">
        <kbd className="kbd">Esc</kbd> or <kbd className="kbd">Enter</kbd> to skip
      </p>
    </div>
  );
}
