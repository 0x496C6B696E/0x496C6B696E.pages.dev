"use client";

import Link from "next/link";
import { useRef, type KeyboardEvent } from "react";
import { destinations, site } from "@/config/site";
import { DestinationIcon } from "@/components/ui/DestinationIcon";
import { quests } from "@/data/projects";
import { github, languageShares } from "@/data/github";
import { formatDate, formatMonth } from "@/lib/format";

/** The desktop: six files on the screen, arrow keys to move between them. */
export function Hub() {
  const list = useRef<HTMLDivElement>(null);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
    if (!keys.includes(event.key)) return;
    const links = Array.from(list.current?.querySelectorAll<HTMLAnchorElement>("a.desk-icon") ?? []);
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
    <div className="safe-x relative flex min-h-dvh flex-col items-center justify-center px-4 pt-10 pb-24">
      <h1 className="sr-only">{site.name} desktop: choose a file</h1>
      <p className="rise-in eyebrow mb-6" style={{ animationDelay: "0ms" }}>
        ~ · {destinations.length} files
      </p>
      <div
        ref={list}
        role="navigation"
        aria-label="Destinations"
        onKeyDown={onKeyDown}
        className="grid w-full max-w-sm grid-cols-2 gap-2 sm:max-w-2xl sm:grid-cols-3 sm:gap-4 lg:max-w-3xl"
      >
        {destinations.map((d, i) => (
          <Link key={d.slug} href={d.path} className="desk-icon rise-in min-h-11" style={{ animationDelay: `${60 + i * 70}ms` }}>
            <span className="glyph">
              <DestinationIcon icon={d.icon} className="size-6" />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="display text-[0.92rem] leading-tight">{d.title}</span>
              <span className="font-mono text-[0.68rem] text-gold/80">{d.file}</span>
              <span className="mt-1 text-xs text-ash">{d.blurb}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="rise-in pointer-events-none mt-10 flex flex-col items-center gap-1.5 text-center" style={{ animationDelay: "560ms" }}>
        <p className="font-mono text-[0.68rem] tracking-wide text-dust" aria-label="System status">
          {quests.length} projects · {tongues} languages{since ? ` · online since ${since}` : ""}
          {snapshot ? ` · github.log ${snapshot}` : ""}
        </p>
        <p className="hidden text-[0.7rem] text-dust sm:block">
          <kbd className="kbd">Tab</kbd> or arrow keys to move · <kbd className="kbd">Enter</kbd> opens · <kbd className="kbd">`</kbd> terminal
        </p>
      </div>
    </div>
  );
}
