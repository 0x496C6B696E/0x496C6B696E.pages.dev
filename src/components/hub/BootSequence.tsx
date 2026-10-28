"use client";

import { useEffect, useMemo, useState } from "react";
import { destinations, site } from "@/config/site";
import { quests } from "@/data/projects";
import { armament } from "@/data/stack";
import { attributes } from "@/data/skills";
import { github, languageShares } from "@/data/github";
import { formatDate } from "@/lib/format";

const STEP_MS = 190;
const HOLD_MS = 650;

/** POST-style boot log. Every number is read from the real data files. */
export function bootLines(): string[] {
  const pieces = armament.reduce((n, g) => n + g.items.length, 0);
  const snapshot = formatDate(github.fetchedAt);
  const tongues = languageShares(50).length;
  return [
    `${site.name} BIOS v${site.version} · ${site.system}`,
    `memory test ............ ${tongues} languages OK`,
    `detecting drives ....... ${quests.length} projects`,
    `loading skills.sys ..... ${attributes.length} capabilities`,
    `mounting stack.cfg ..... ${pieces} entries`,
    snapshot ? `reading github.log ..... snapshot ${snapshot}` : "reading github.log ..... empty",
    `mounting ~ ............. ${destinations.length} files`,
    "network ................ mail.msg, 2 routes",
    "boot complete. welcome back, operator.",
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

  return (
    <div className="rise-in flex min-h-dvh flex-col items-center justify-center px-6 text-center" aria-live="polite" data-testid="boot">
      <pre className="w-full max-w-xl text-left font-mono text-[0.78rem] leading-7 text-gold sm:text-sm" aria-label="Boot sequence">
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
