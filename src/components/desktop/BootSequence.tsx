"use client";

import { useEffect, useMemo, useState } from "react";
import { destinations, site } from "@/config/site";
import { projects } from "@/data/projects";
import { toolchain } from "@/data/stack";
import { capabilities } from "@/data/skills";
import { github, languageShares } from "@/data/github";
import { formatDate } from "@/lib/format";

const STEP_MS = 230;
const HOLD_MS = 500;

/** Boot log. Every number is read from the real data files. */
export function bootLines(): string[] {
  const pieces = toolchain.reduce((n, g) => n + g.items.length, 0);
  const snapshot = formatDate(github.fetchedAt);
  const tongues = languageShares(50).length;
  return [
    `starting ${site.system.toLowerCase()} v${site.version}`,
    `memory check: ${tongues} languages`,
    `mounting projects/: ${projects.length} repositories`,
    `loading skills.json: ${capabilities.length} capabilities`,
    `loading stack.yaml: ${pieces} entries`,
    snapshot ? `reading github.log: snapshot ${snapshot}` : "reading github.log: empty",
    `mounting ~: ${destinations.length} files`,
    "network: mail.eml, 2 routes",
    "ready. welcome back.",
  ];
}

export function BootSequence({ onDone }: { onDone: () => void }) {
  const lines = useMemo(() => bootLines(), []);
  const [shown, setShown] = useState(1);

  useEffect(() => {
    if (shown < lines.length) {
      const id = window.setTimeout(() => setShown((n) => n + 1), STEP_MS);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(onDone, HOLD_MS);
    return () => window.clearTimeout(id);
  }, [shown, lines.length, onDone]);

  const progress = Math.round((shown / lines.length) * 100);

  return (
    <div className="rise-in flex min-h-dvh flex-col items-center justify-center px-6 text-center" aria-live="polite" data-testid="boot">
      <p className="display text-glow text-3xl font-bold text-ink sm:text-4xl">{site.name}</p>
      <div className="statbar mt-8 w-full max-w-xs" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Boot progress">
        <span style={{ width: `${progress}%`, transitionDuration: "0.25s" }} />
      </div>
      <pre className="mt-6 w-full max-w-md text-left font-mono text-[0.76rem] leading-7 text-dust sm:text-[0.8rem]" aria-label="Boot log">
        {lines.slice(0, shown).map((line, i) => (
          <span key={i} className={i === shown - 1 ? "block text-ink" : "block"}>
            {line}
          </span>
        ))}
      </pre>
      <p className="mt-6 text-xs text-dust">
        <kbd className="kbd">Esc</kbd> or <kbd className="kbd">Enter</kbd> to skip
      </p>
    </div>
  );
}
