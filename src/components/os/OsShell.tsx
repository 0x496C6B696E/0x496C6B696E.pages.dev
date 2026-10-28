"use client";

import { useState } from "react";
import { useExperience } from "@/components/experience/ExperienceProvider";
import { Panel } from "./Panel";
import { DesktopIcons } from "./DesktopIcons";
import { TrashWindow } from "./TrashWindow";
import { DeskOverlay } from "./DeskOverlay";

/**
 * The operating system drawn over the centre screen: the top panel, the desktop icons and the
 * Trash. It lives in the layout so it stays behind every window. It is hidden until the boot
 * has finished and the camera has arrived at the screen (`osReady`), and replaced by the desk
 * overlay while the camera is zoomed out.
 */
export function OsShell() {
  const { stage, mounted, entered, osReady } = useExperience();
  const [trash, setTrash] = useState(false);

  if (!mounted || !entered) return null;
  if (stage === "desk") return <DeskOverlay />;

  return (
    <>
      {/* icons sit under the windows (main is z-10) */}
      <div className="os-gate pointer-events-none fixed inset-0 z-[5]" data-ready={osReady} data-stage={stage}>
        <DesktopIcons onTrash={() => setTrash(true)} />
      </div>
      <div className="os-gate relative z-20" data-ready={osReady}>
        <Panel />
        <TrashWindow open={trash} onClose={() => setTrash(false)} />
      </div>
    </>
  );
}
