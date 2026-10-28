"use client";

import { useEffect, useMemo, useState } from "react";
import { destinations, site } from "@/config/site";
import { quests } from "@/data/projects";
import { armament } from "@/data/stack";
import { attributes } from "@/data/skills";
import { github } from "@/data/github";
import { formatDate } from "@/lib/format";

const STEP_MS = 210;
const HOLD_MS = 650;

/** Boot-log style transition. Every number is read from the real data files. */
export function kindlingLines(): string[] {
  const pieces = armament.reduce((n, g) => n + g.items.length, 0);
  const snapshot = formatDate(github.fetchedAt);
  return [
    `${site.name} kindling sequence v1.0`,
    "checking embers ............ 170 OK",
    "raising ruins .............. 12 columns, 1 arch",
    `placing waystones .......... ${destinations.length}`,
    `opening quest archive ...... ${quests.length} records`,
    `reading character sheet .... ${attributes.length} attributes`,
    `binding armament ........... ${pieces} pieces`,
    snapshot ? `reading soul memory ........ snapshot ${snapshot}` : "reading soul memory ........ silent",
    "placing summon signs ....... 2",
    "fire lit. welcome, traveller.",
  ];
}

export function KindlingSequence({ onDone }: { onDone: () => void }) {
  const lines = useMemo(() => kindlingLines(), []);
  const [shown, setShown] = useState(1);

  useEffect(() => {
    if (shown < lines.length) {
      const id = window.setTimeout(() => setShown((n) => n + 1), STEP_MS);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(onDone, HOLD_MS);
    return () => window.clearTimeout(id);
  }, [shown, lines.length, onDone]);

  return (
    <div className="rise-in flex min-h-dvh flex-col items-center justify-center px-6 text-center" aria-live="polite" data-testid="kindling">
      <pre className="w-full max-w-xl text-left font-mono text-[0.78rem] leading-7 text-gold sm:text-sm" aria-label="Kindling sequence">
        {lines.slice(0, shown).map((line, i) => (
          <span key={i} className={i === 0 ? "block text-flare" : "block"}>
            {i === 0 ? "" : "> "}
            {line}
          </span>
        ))}
        <span className="blink inline-block h-4 w-2 translate-y-0.5 bg-gold" aria-hidden="true" />
      </pre>
      <p className="mt-8 text-xs text-dust">
        <kbd className="kbd">Esc</kbd> or <kbd className="kbd">Enter</kbd> to skip
      </p>
    </div>
  );
}
