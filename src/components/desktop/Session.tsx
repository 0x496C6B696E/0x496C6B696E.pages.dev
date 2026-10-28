"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useExperience, type Mode } from "@/components/experience/ExperienceProvider";
import { bootDuration } from "@/lib/boot";
import { LockScreen } from "./LockScreen";
import { DesktopHome } from "./Desktop";
import { BootSequence } from "./BootSequence";

const LEAVE_MS = 500;

/**
 * Lock screen -> (fade) -> boot -> desktop.
 * In Immersive mode the boot log is painted onto the 3D monitor while the camera travels to it,
 * and the HTML desktop only appears once the camera has arrived (the provider's `osReady`).
 * If the room is not drawing yet, an HTML boot screen stands in. Explorer mode and reduced
 * motion skip the boot entirely. The 3D tower's power button powers on through `onPower`.
 */
export function Session() {
  const { entered, enter, mounted, reducedMotion, setMode, mode, onPower, boot, setBoot, sceneReady } = useExperience();
  const [leaving, setLeaving] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const finish = useCallback(() => {
    window.clearTimeout(timer.current);
    setBoot(null);
  }, [setBoot]);

  const begin = useCallback(
    (next?: Mode) => {
      if (next) setMode(next);
      const cinematic = (next ?? mode) === "immersive" && !reducedMotion;
      if (!cinematic) {
        enter();
        return;
      }
      setLeaving(true);
      timer.current = window.setTimeout(() => {
        setLeaving(false);
        enter();
        setBoot(sceneReady ? "painted" : "html");
        timer.current = window.setTimeout(() => setBoot(null), bootDuration());
      }, LEAVE_MS);
    },
    [enter, mode, reducedMotion, setMode, setBoot, sceneReady],
  );

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // The power button (or the monitor) in the 3D room fires an event; it powers on only while still locked.
  useEffect(
    () =>
      onPower(() => {
        if (!entered) begin();
      }),
    [onPower, entered, begin],
  );

  useEffect(() => {
    if (!boot) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter" || event.key === " ") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [boot, finish]);

  if (!entered) return <LockScreen onEnter={begin} ready={mounted} leaving={leaving} />;
  if (boot === "html") return <BootSequence />;
  if (boot === "painted") {
    return (
      <p className="sr-only" role="status" data-testid="boot">
        Booting the workstation. Press Escape to skip.
      </p>
    );
  }
  return <DesktopHome />;
}
