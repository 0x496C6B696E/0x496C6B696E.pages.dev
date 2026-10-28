"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { destinations, type DestinationSlug } from "@/config/site";
import { DestinationIcon } from "@/components/ui/DestinationIcon";
import { useExperience } from "@/components/experience/ExperienceProvider";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { sceneAnchors } from "@/lib/sceneAnchors";
import { cn } from "@/lib/cn";
import { quests } from "@/data/projects";
import { github, languageShares } from "@/data/github";
import { formatDate, formatMonth } from "@/lib/format";

/** CSS fallback placement while the 3D scene has not published anchors yet (or on narrow screens). */
const RING: Record<DestinationSlug, string> = {
  about: "left-[8%] top-[24%] xl:left-[14%]",
  skills: "left-1/2 top-[11%] -translate-x-1/2",
  projects: "right-[8%] top-[24%] xl:right-[14%]",
  stack: "left-[10%] bottom-[20%] xl:left-[16%]",
  stats: "right-[10%] bottom-[20%] xl:right-[16%]",
  contact: "left-1/2 bottom-[7%] -translate-x-1/2",
};

export function Hub() {
  const { mode } = useExperience();
  const wide = useMediaQuery("(min-width: 1024px) and (min-height: 640px)");
  const list = useRef<HTMLDivElement>(null);
  const stones = useRef<Partial<Record<DestinationSlug, HTMLDivElement | null>>>({});
  const [anchored, setAnchored] = useState(false);
  const ring = mode === "immersive" && wide;

  // Follow the 3D stones: the scene publishes projected positions every frame.
  useEffect(() => {
    if (!ring) return;
    let first = true;
    return sceneAnchors.subscribe((anchors) => {
      for (const d of destinations) {
        const el = stones.current[d.slug];
        const a = anchors[d.slug];
        if (!el || !a) continue;
        el.style.transform = `translate(-50%, -100%) translate(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px) scale(${a.scale.toFixed(3)})`;
        el.style.visibility = a.visible ? "visible" : "hidden";
      }
      if (first) {
        first = false;
        setAnchored(true);
      }
    });
  }, [ring]);

  useEffect(() => () => sceneAnchors.setHovered(null), []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
    if (!keys.includes(event.key)) return;
    const links = Array.from(list.current?.querySelectorAll<HTMLAnchorElement>("a.waystone") ?? []);
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (index === -1) return;
    event.preventDefault();
    const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
    links[(index + (forward ? 1 : links.length - 1)) % links.length]?.focus();
  };

  const snapshot = formatDate(github.fetchedAt);
  const since = formatMonth(github.user?.createdAt);
  const tongues = languageShares(50).length;

  return (
    <div className="safe-x safe-b relative min-h-dvh">
      <h1 className="sr-only">BonfireOS: choose a destination</h1>
      <div
        ref={list}
        role="navigation"
        aria-label="Destinations"
        onKeyDown={onKeyDown}
        className={cn(
          ring
            ? "absolute inset-0"
            : "mx-auto grid max-w-3xl grid-cols-1 gap-3 px-4 pt-24 pb-28 sm:grid-cols-2 lg:max-w-5xl lg:grid-cols-3 lg:pt-32",
        )}
      >
        {destinations.map((d, i) => (
          // The wrapper only carries position (projected transform or CSS ring); the entrance
          // animation lives on the link so its keyframes never override that transform.
          <div
            key={d.slug}
            ref={(el) => {
              stones.current[d.slug] = el;
            }}
            className={cn(ring && (anchored && sceneAnchors.active ? "absolute top-0 left-0 w-[12.5rem] will-change-transform" : `absolute w-[12.5rem] ${RING[d.slug]}`))}
          >
            <Link
              href={d.path}
              className={cn("waystone rise-in min-h-11", !ring && "h-full flex-row items-center gap-4 text-left sm:flex-col sm:text-center")}
              style={{ animationDelay: `${i * 80}ms` }}
              onPointerEnter={() => sceneAnchors.setHovered(d.slug)}
              onPointerLeave={() => sceneAnchors.setHovered(null)}
              onFocus={() => sceneAnchors.setHovered(d.slug)}
              onBlur={() => sceneAnchors.setHovered(null)}
            >
              <span className="rune">
                <DestinationIcon icon={d.icon} className="size-5" />
              </span>
              <span className="flex flex-col gap-1">
                <span className="display text-[0.95rem] leading-tight tracking-[0.08em]">{d.title}</span>
                <span className="eyebrow text-[0.58rem] tracking-[0.26em] opacity-90">{d.label}</span>
                <span className={cn("text-xs text-ash", ring && "sr-only")}>{d.blurb}</span>
              </span>
            </Link>
          </div>
        ))}
      </div>

      <div className={cn("rise-in pointer-events-none absolute inset-x-0 bottom-2 flex flex-col items-center gap-1.5 text-center", !ring && "hidden lg:flex")} style={{ animationDelay: "600ms" }}>
        <p className="font-mono text-[0.68rem] tracking-wide text-dust" aria-label="Camp status">
          {quests.length} records · {tongues} tongues{since ? ` · journey since ${since}` : ""}
          {snapshot ? ` · soul memory ${snapshot}` : ""}
        </p>
        {ring && (
          <p className="text-[0.7rem] text-dust">
            <kbd className="kbd">Tab</kbd> or arrow keys to move · <kbd className="kbd">Enter</kbd> to travel · <kbd className="kbd">`</kbd> opens the terminal
          </p>
        )}
      </div>
    </div>
  );
}
