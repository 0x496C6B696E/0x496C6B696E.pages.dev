"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useExperience } from "./ExperienceProvider";

/**
 * Keyboard shortcuts that must work from the very first frame, so they live in the persistent
 * layout rather than inside a window that mounts on navigation:
 * - Escape inside a window returns to the desktop (unless the terminal, a menu or a dialog owns the key).
 * - Escape at the desk zooms back into the screen.
 */
export function GlobalKeys() {
  const router = useRouter();
  const pathname = usePathname();
  const { stage, goToScreen } = useExperience();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("dialog, [data-keeps-escape]")) return;
      if (stage === "desk") goToScreen();
      else if (pathname !== "/") router.push("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, pathname, stage, goToScreen]);

  return null;
}
