"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ReactNode } from "react";
import { useExperience } from "./ExperienceProvider";
import { RoomFallback } from "./RoomFallback";
import { cn } from "@/lib/cn";

// The WebGL room is only ever downloaded when a visitor is actually going to see it.
const WorkstationScene = dynamic(() => import("@/components/scene/WorkstationScene"), { ssr: false });

/** If the renderer cannot be created (no WebGL, blocked GPU), fall back to the CSS wallpaper for good. */
class SceneBoundary extends Component<{ onFail: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function Backdrop() {
  const { mode, webgl, mounted, stage, boot, reducedMotion, lowPower, sound, disableWebgl, requestPower, lock, goToScreen, setTerminalOpen, setSound, setSceneReady, setSettled, setHint } = useExperience();
  const [idle, setIdle] = useState(false);

  // Let the first paint (wordmark, power button) land before pulling in three.js.
  useEffect(() => {
    const id = window.setTimeout(() => setIdle(true), 300);
    return () => window.clearTimeout(id);
  }, []);

  const immersive = mounted && mode === "immersive" && webgl;
  const show3d = immersive && idle;
  const screen = stage === "lock" ? "off" : boot === "painted" ? "boot" : "desktop";

  return (
    <div className="fixed inset-0 z-0 overflow-hidden" data-backdrop={immersive ? "3d" : "css"}>
      <div aria-hidden="true" className="absolute inset-0">
        <RoomFallback animated={mounted && !reducedMotion && !immersive} />
      </div>
      {show3d && (
        <SceneBoundary onFail={disableWebgl}>
          <WorkstationScene
            stage={stage}
            screen={screen}
            reducedMotion={reducedMotion}
            lowPower={lowPower}
            sound={sound}
            onContextLost={disableWebgl}
            onReady={setSceneReady}
            onSettled={setSettled}
            onHint={setHint}
            onPowerOn={requestPower}
            onPowerOff={lock}
            onMonitor={goToScreen}
            onKeyboard={() => {
              goToScreen();
              setTerminalOpen(true);
            }}
            onSpeakers={() => setSound(!sound)}
          />
        </SceneBoundary>
      )}
      <div className="vignette" aria-hidden="true" />
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 bg-void/70 transition-opacity duration-500 ease-[var(--ease-soft)]",
          stage === "window" ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
    </div>
  );
}
