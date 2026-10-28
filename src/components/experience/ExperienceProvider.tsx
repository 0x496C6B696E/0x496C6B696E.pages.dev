"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export type Mode = "immersive" | "explorer";
/** Where the visitor is: the dark camp, the lit hub, or inside a destination panel. */
export type Stage = "entry" | "hub" | "panel";

interface Experience {
  /** null until mounted (SSR renders a neutral state). */
  mode: Mode | null;
  setMode: (mode: Mode) => void;
  entered: boolean;
  enter: () => void;
  stage: Stage;
  reducedMotion: boolean;
  webgl: boolean;
  disableWebgl: () => void;
  lowPower: boolean;
  mounted: boolean;
  terminalOpen: boolean;
  setTerminalOpen: (open: boolean) => void;
  /** Procedural fire ambience; always starts off and is only enabled by a user gesture. */
  sound: boolean;
  setSound: (on: boolean) => void;
}

const ExperienceContext = createContext<Experience | null>(null);

const MODE_KEY = "bonfireos:mode";
const ENTERED_KEY = "bonfireos:entered";

function readStorage(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(storage: Storage, key: string, value: string) {
  try {
    storage.setItem(key, value);
  } catch {
    /* private mode or blocked storage: the experience still works for this page view */
  }
}

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mode, setModeState] = useState<Mode | null>(null);
  const [entered, setEntered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const [lowPower, setLowPower] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [sound, setSound] = useState(false);

  // Capability detection must happen after hydration (window is needed and the server
  // cannot know the answer), so a one-time setState in an effect is the correct tool here.
  // WebGL itself is never probed up front (creating a throwaway context costs real main-thread
  // time); the scene reports failure through disableWebgl() if a context cannot be created.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
    const saveData = Boolean(nav.connection?.saveData);
    const weak = (navigator.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2;
    const small = window.matchMedia("(max-width: 767px)").matches;

    const stored = readStorage(localStorage, MODE_KEY);
    // Phones start in Explorer (CSS camp) to keep the first load light; the toggle still offers 3D.
    const defaultMode: Mode = !motion && !saveData && !weak && !small ? "immersive" : "explorer";

    setReducedMotion(motion);
    setLowPower(small || weak || saveData);
    setModeState(stored === "immersive" || stored === "explorer" ? stored : defaultMode);
    setEntered(readStorage(sessionStorage, ENTERED_KEY) === "1");
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Deep-linking into a destination counts as having entered the camp.
  const deepLinked = pathname !== "/";
  useEffect(() => {
    if (deepLinked) writeStorage(sessionStorage, ENTERED_KEY, "1");
  }, [deepLinked]);

  const setMode = useCallback((next: Mode) => {
    setModeState(next);
    writeStorage(localStorage, MODE_KEY, next);
  }, []);

  const enter = useCallback(() => {
    setEntered(true);
    writeStorage(sessionStorage, ENTERED_KEY, "1");
  }, []);

  const disableWebgl = useCallback(() => {
    setWebgl(false);
    setModeState("explorer");
  }, []);

  const stage: Stage = deepLinked ? "panel" : entered ? "hub" : "entry";
  const effectiveEntered = entered || deepLinked;

  const value = useMemo<Experience>(
    () => ({
      mode: mode === "immersive" && !webgl ? "explorer" : mode,
      setMode,
      entered: effectiveEntered,
      enter,
      stage,
      reducedMotion,
      webgl,
      disableWebgl,
      lowPower,
      mounted,
      terminalOpen,
      setTerminalOpen,
      sound,
      setSound,
    }),
    [mode, webgl, setMode, effectiveEntered, enter, stage, reducedMotion, disableWebgl, lowPower, mounted, terminalOpen, sound],
  );

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

export function useExperience(): Experience {
  const ctx = useContext(ExperienceContext);
  if (!ctx) throw new Error("useExperience must be used inside <ExperienceProvider>");
  return ctx;
}
