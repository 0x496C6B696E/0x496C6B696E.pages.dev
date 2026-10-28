"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useExperience, type Mode } from "@/components/experience/ExperienceProvider";
import { EntryScreen } from "./EntryScreen";
import { Hub } from "./Hub";
import { KindlingSequence } from "./KindlingSequence";

const LEAVE_MS = 600;

type Phase = "leaving" | "kindling" | null;

/**
 * Entry camp -> (fade out) -> kindling boot log -> hub.
 * All motion is CSS; this component only sequences mount/unmount. The cinematic path is
 * skipped entirely in Explorer mode or with reduced motion, and can be cut short at any time.
 */
export function HubExperience() {
  const { entered, enter, mounted, reducedMotion, setMode, mode } = useExperience();
  const [phase, setPhase] = useState<Phase>(null);
  const timer = useRef<number | undefined>(undefined);

  const finish = useCallback(() => {
    window.clearTimeout(timer.current);
    enter();
    setPhase(null);
  }, [enter]);

  const begin = (next?: Mode) => {
    if (next) setMode(next);
    const cinematic = (next ?? mode) === "immersive" && !reducedMotion;
    if (!cinematic) {
      enter();
      return;
    }
    setPhase("leaving");
    timer.current = window.setTimeout(() => {
      enter();
      setPhase("kindling");
    }, LEAVE_MS);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (!phase) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter" || event.key === " ") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, finish]);

  if (!entered) return <EntryScreen onEnter={begin} ready={mounted} leaving={phase === "leaving"} />;
  if (phase === "kindling") return <KindlingSequence onDone={finish} />;
  return <Hub />;
}
