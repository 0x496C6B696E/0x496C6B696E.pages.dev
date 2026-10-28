"use client";

import Link from "next/link";
import { useRef, type KeyboardEvent } from "react";
import { destinations, type DestinationSlug } from "@/config/site";
import { DestinationIcon } from "@/components/ui/DestinationIcon";
import { useExperience } from "@/components/experience/ExperienceProvider";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { cn } from "@/lib/cn";

/** Waystone placement around the fire on large screens (the fire sits at the viewport centre). */
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
  const ring = mode === "immersive" && wide;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
    if (!keys.includes(event.key)) return;
    const stones = Array.from(list.current?.querySelectorAll<HTMLAnchorElement>("a.waystone") ?? []);
    const index = stones.indexOf(document.activeElement as HTMLAnchorElement);
    if (index === -1) return;
    event.preventDefault();
    const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
    stones[(index + (forward ? 1 : stones.length - 1)) % stones.length]?.focus();
  };

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
          <div key={d.slug} className={cn("rise-in", ring && `absolute w-[12.5rem] ${RING[d.slug]}`)} style={{ animationDelay: `${i * 80}ms` }}>
            <Link href={d.path} className={cn("waystone min-h-11", !ring && "h-full flex-row items-center gap-4 text-left sm:flex-col sm:text-center")}>
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

      {ring && (
        <p className="rise-in pointer-events-none absolute inset-x-0 bottom-2 text-center text-[0.7rem] text-dust" style={{ animationDelay: "600ms" }}>
          <kbd className="kbd">Tab</kbd> or arrow keys to move · <kbd className="kbd">Enter</kbd> to travel · <kbd className="kbd">Esc</kbd> returns here
        </p>
      )}
    </div>
  );
}
