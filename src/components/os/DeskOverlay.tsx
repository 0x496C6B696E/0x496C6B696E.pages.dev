"use client";

import { Monitor } from "lucide-react";
import { useExperience } from "@/components/experience/ExperienceProvider";

/**
 * Shown while the camera is zoomed out to the desk: a hint for whatever the pointer is over
 * and the way back in. Everything on the desk is clickable in the 3D room itself.
 */
export function DeskOverlay() {
  const { hint, goToScreen } = useExperience();
  return (
    <div className="safe-x pointer-events-none fixed inset-0 z-20 flex flex-col justify-between px-4 py-4 sm:px-6 sm:py-6" data-stage="desk">
      <p className="rise-in max-w-md text-sm text-ash">
        <span className="font-medium text-ink">The desk.</span> Drag to look around, scroll to move closer. Click the lamp, the mug, the case, the speakers, the plant or the other two screens. The lower centre screen takes you back in.
      </p>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="hint-chip" role="status" aria-live="polite">
          {hint ?? "Point at something on the desk"}
        </p>
        <button type="button" className="btn btn-primary pointer-events-auto" onClick={goToScreen}>
          <Monitor className="size-4" aria-hidden="true" />
          Back to the screen
        </button>
      </div>
    </div>
  );
}
