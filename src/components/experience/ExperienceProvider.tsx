"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { usePathname, useRouter } from "next/navigation";

export type Mode = "immersive" | "explorer";
/** Where the camera is: the locked machine, the whole desk, the centre screen (desktop), or inside a window. */
export type Stage = "lock" | "desk" | "desktop" | "window";
/** How the boot is being shown, if it is running. */
export type Boot = "html" | "painted" | null;

interface Experience {
  /** null until mounted (SSR renders a neutral state). */
  mode: Mode | null;
  setMode: (mode: Mode) => void;
  entered: boolean;
  enter: () => void;
  /** Power off: back to the lock screen and the wide room view. */
  lock: () => void;
  stage: Stage;
  /** Zoom out of the screen to the desk (Immersive mode only). */
  goToDesk: () => void;
  /** Zoom back into the centre screen. */
  goToScreen: () => void;
  /** False while the 3D camera is travelling between two views; the HTML OS waits for it. */
  settled: boolean;
  setSettled: (settled: boolean) => void;
  boot: Boot;
  setBoot: (boot: Boot) => void;
  /** The 3D room has a renderer and is drawing. */
  sceneReady: boolean;
  setSceneReady: (ready: boolean) => void;
  /** True when the HTML operating system may be shown over the screen. */
  osReady: boolean;
  reducedMotion: boolean;
  webgl: boolean;
  disableWebgl: () => void;
  lowPower: boolean;
  mounted: boolean;
  terminalOpen: boolean;
  setTerminalOpen: (open: boolean) => void;
  /** Procedural room tone; always starts off and is only enabled by a user gesture. */
  sound: boolean;
  setSound: (on: boolean) => void;
  /** What the pointer is over in the 3D room while at the desk, e.g. "Desk lamp: turn off". */
  hint: string | null;
  setHint: Dispatch<SetStateAction<string | null>>;
  /** Fired when something other than the lock-screen button asks to power on (the 3D tower button). */
  requestPower: () => void;
  /** Subscribe to power requests; returns the unsubscribe function. */
  onPower: (listener: () => void) => () => void;
}

const ExperienceContext = createContext<Experience | null>(null);

const MODE_KEY = "workstation:mode";
const ENTERED_KEY = "workstation:entered";

function readStorage(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(storage: Storage, key: string, value: string | null) {
  try {
    if (value === null) storage.removeItem(key);
    else storage.setItem(key, value);
  } catch {
    /* private mode or blocked storage: the experience still works for this page view */
  }
}

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mode, setModeState] = useState<Mode | null>(null);
  const [entered, setEntered] = useState(false);
  const [view, setView] = useState<"screen" | "desk">("screen");
  const [settled, setSettled] = useState(true);
  const [boot, setBoot] = useState<Boot>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const [lowPower, setLowPower] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [sound, setSound] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const powerListeners = useRef(new Set<() => void>());

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
    // Phones start in Explorer (CSS wallpaper) to keep the first load light; the panel toggle offers 3D.
    const defaultMode: Mode = !motion && !saveData && !weak && !small ? "immersive" : "explorer";

    setReducedMotion(motion);
    setLowPower(small || weak || saveData);
    setModeState(stored === "immersive" || stored === "explorer" ? stored : defaultMode);
    setEntered(readStorage(sessionStorage, ENTERED_KEY) === "1");
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Deep-linking into an app counts as having powered on.
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

  const lock = useCallback(() => {
    setEntered(false);
    setView("screen");
    setTerminalOpen(false);
    setBoot(null);
    writeStorage(sessionStorage, ENTERED_KEY, null);
    if (pathname !== "/") router.push("/");
  }, [pathname, router]);

  const goToDesk = useCallback(() => {
    setTerminalOpen(false);
    setView("desk");
    if (pathname !== "/") router.push("/");
  }, [pathname, router]);

  const goToScreen = useCallback(() => setView("screen"), []);

  const disableWebgl = useCallback(() => {
    setWebgl(false);
    setModeState("explorer");
    setSceneReady(false);
  }, []);

  const requestPower = useCallback(() => {
    for (const listener of powerListeners.current) listener();
  }, []);
  const onPower = useCallback((listener: () => void) => {
    powerListeners.current.add(listener);
    return () => {
      powerListeners.current.delete(listener);
    };
  }, []);

  const effectiveMode: Mode | null = mode === "immersive" && !webgl ? "explorer" : mode;
  const effectiveEntered = entered || deepLinked;
  const stage: Stage = !effectiveEntered ? "lock" : deepLinked ? "window" : view === "desk" && effectiveMode === "immersive" ? "desk" : "desktop";
  // The OS text must never appear before the screen does: wait for the boot and the camera.
  const osReady = boot === null && (effectiveMode !== "immersive" || reducedMotion || settled);

  const value = useMemo<Experience>(
    () => ({
      mode: effectiveMode,
      setMode,
      entered: effectiveEntered,
      enter,
      lock,
      stage,
      goToDesk,
      goToScreen,
      settled,
      setSettled,
      boot,
      setBoot,
      sceneReady,
      setSceneReady,
      osReady,
      reducedMotion,
      webgl,
      disableWebgl,
      lowPower,
      mounted,
      terminalOpen,
      setTerminalOpen,
      sound,
      setSound,
      hint,
      setHint,
      requestPower,
      onPower,
    }),
    [effectiveMode, setMode, effectiveEntered, enter, lock, stage, goToDesk, goToScreen, settled, boot, sceneReady, osReady, reducedMotion, webgl, disableWebgl, lowPower, mounted, terminalOpen, sound, hint, requestPower, onPower],
  );

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

export function useExperience(): Experience {
  const ctx = useContext(ExperienceContext);
  if (!ctx) throw new Error("useExperience must be used inside <ExperienceProvider>");
  return ctx;
}
