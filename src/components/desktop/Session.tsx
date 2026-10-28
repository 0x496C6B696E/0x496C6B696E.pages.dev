"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useExperience, type Mode } from "@/components/experience/ExperienceProvider";
import { LockScreen } from "./LockScreen";
import { Desktop } from "./Desktop";
import { BootSequence } from "./BootSequence";

const LEAVE_MS = 500;

type Phase = "leaving" | "booting" | null;

/**
 * Lock screen -> (fade) -> boot log -> desktop.
 * All motion is CSS; this component only sequences mount/unmount. The boot is skipped
 * entirely in Explorer mode or with reduced motion, and can be cut short at any time.
 * The 3D tower's power button powers on through the provider's `onPower` event.
 */
export function Session() {
  const { entered, enter, mounted, reducedMotion, setMode, mode, onPower } = useExperience();
  const [phase, setPhase] = useState<Phase>(null);
  const timer = useRef<number | undefined>(undefined);

  const finish = useCallback(() => {
    window.clearTimeout(timer.current);
    enter();
    setPhase(null);
  }, [enter]);

  const begin = useCallback(
    (next?: Mode) => {
      if (next) setMode(next);
      const cinematic = (next ?? mode) === "immersive" && !reducedMotion;
      if (!cinematic) {
        enter();
        return;
      }
      setPhase("leaving");
      timer.current = window.setTimeout(() => {
        enter();
        setPhase("booting");
      }, LEAVE_MS);
    },
    [enter, mode, reducedMotion, setMode],
  );

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // The power button in the 3D room fires an event; it powers on only while still locked.
  useEffect(() => onPower(() => {
    if (!entered) begin();
  }), [onPower, entered, begin]);

  useEffect(() => {
    if (!phase) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter" || event.key === " ") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, finish]);

  if (!entered) return <LockScreen onEnter={begin} ready={mounted} leaving={phase === "leaving"} />;
  if (phase === "booting") return <BootSequence onDone={finish} />;
  return <Desktop />;
}
