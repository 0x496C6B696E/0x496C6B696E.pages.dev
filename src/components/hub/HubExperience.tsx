"use client";

import { useEffect, useRef, useState } from "react";
import { useExperience, type Mode } from "@/components/experience/ExperienceProvider";
import { EntryScreen } from "./EntryScreen";
import { Hub } from "./Hub";

const LEAVE_MS = 600;
const KINDLE_MS = 1300;

type Phase = "leaving" | "kindling" | null;

/**
 * Entry camp -> (fade out) -> short kindling -> hub.
 * All motion is CSS; this component only sequences mount/unmount. The cinematic path is
 * skipped entirely in Explorer mode or with reduced motion, and can be cut short at any time.
 */
export function HubExperience() {
  const { entered, enter, mounted, reducedMotion, setMode, mode } = useExperience();
  const [phase, setPhase] = useState<Phase>(null);
  const timers = useRef<number[]>([]);

  const clear = () => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  };

  const finish = () => {
    clear();
    enter();
    setPhase(null);
  };

  const begin = (next?: Mode) => {
    if (next) setMode(next);
    const cinematic = (next ?? mode) === "immersive" && !reducedMotion;
    if (!cinematic) {
      enter();
      return;
    }
    setPhase("leaving");
    timers.current.push(
      window.setTimeout(() => {
        enter();
        setPhase("kindling");
      }, LEAVE_MS),
      window.setTimeout(() => setPhase(null), LEAVE_MS + KINDLE_MS),
    );
  };

  useEffect(() => clear, []);

  useEffect(() => {
    if (!phase) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter" || event.key === " ") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // finish is stable for the lifetime of the component
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (!entered) return <EntryScreen onEnter={begin} ready={mounted} leaving={phase === "leaving"} />;

  if (phase === "kindling") {
    return (
      <div className="rise-in flex min-h-dvh flex-col items-center justify-center gap-6 text-center" aria-live="polite">
        <p className="display text-glow text-sm tracking-[0.4em] text-gold uppercase">The fire takes</p>
        <button type="button" className="btn btn-ghost btn-sm" onClick={finish} autoFocus>
          Skip
        </button>
      </div>
    );
  }

  return <Hub />;
}
