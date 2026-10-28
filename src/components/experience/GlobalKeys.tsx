"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Keyboard shortcuts that must work from the very first frame, so they live in the persistent
 * layout rather than inside a window that mounts on navigation:
 * - Escape inside a window returns to the desktop (unless the terminal or a dialog owns the key).
 */
export function GlobalKeys() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented || pathname === "/") return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("dialog, [data-keeps-escape]")) return;
      router.push("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, pathname]);

  return null;
}
