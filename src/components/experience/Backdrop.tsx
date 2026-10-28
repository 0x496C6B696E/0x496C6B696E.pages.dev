"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ReactNode } from "react";
import { useExperience } from "./ExperienceProvider";
import { EmberFallback } from "./EmberFallback";
import { cn } from "@/lib/cn";

// The WebGL scene is only ever downloaded when a visitor is actually going to see it.
const BonfireScene = dynamic(() => import("@/components/scene/BonfireScene"), { ssr: false });

/** If the renderer cannot be created (no WebGL, blocked GPU), fall back to the CSS camp for good. */
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
  const { mode, webgl, mounted, stage, reducedMotion, lowPower, disableWebgl } = useExperience();
  const [idle, setIdle] = useState(false);

  // Let the first paint (title, button) land before pulling in three.js.
  useEffect(() => {
    const id = window.setTimeout(() => setIdle(true), 300);
    return () => window.clearTimeout(id);
  }, []);

  const immersive = mounted && mode === "immersive" && webgl;
  const show3d = immersive && idle;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true" data-backdrop={immersive ? "3d" : "css"}>
      <EmberFallback animated={mounted && !reducedMotion && !immersive} />
      {show3d && (
        <SceneBoundary onFail={disableWebgl}>
          <BonfireScene stage={stage} reducedMotion={reducedMotion} lowPower={lowPower} onContextLost={disableWebgl} />
        </SceneBoundary>
      )}
      <div className="vignette" />
      <div
        className={cn(
          "absolute inset-0 bg-abyss/70 transition-opacity duration-700 ease-[var(--ease-soft)]",
          stage === "panel" ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
    </div>
  );
}
