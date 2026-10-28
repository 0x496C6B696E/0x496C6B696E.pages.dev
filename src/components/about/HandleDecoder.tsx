"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/** Splits a 0x-prefixed hex handle into byte pairs and their ASCII letters. */
export function decodeHandle(handle: string): Array<{ hex: string; char: string }> {
  const hex = handle.replace(/^0x/i, "");
  const pairs = hex.match(/.{2}/g) ?? [];
  return pairs.map((pair) => ({ hex: pair.toUpperCase(), char: String.fromCharCode(parseInt(pair, 16)) }));
}

export function HandleDecoder({ handle }: { handle: string }) {
  const [revealed, setRevealed] = useState(false);
  const bytes = decodeHandle(handle);

  return (
    <section aria-labelledby="sigil" className="card p-5">
      <h2 id="sigil" className="eyebrow mb-3">
        The handle
      </h2>
      <p className="text-sm text-ash">The handle is not random. It is a name, written as hexadecimal ASCII bytes.</p>
      <div className="mt-4 flex flex-wrap items-end gap-2 font-mono" aria-live="polite">
        <span className="pb-1 text-sm text-dust">0x</span>
        {bytes.map((b, i) => (
          <span key={i} className="flex flex-col items-center gap-1">
            <span
              className={cn(
                "display text-xl text-glow transition-[opacity,transform] duration-300 ease-(--ease-soft)",
                revealed ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0",
              )}
              style={{ transitionDelay: revealed ? `${i * 80}ms` : "0ms" }}
              aria-hidden={!revealed}
            >
              {b.char}
            </span>
            <span className="rounded-sm border border-edge bg-void/60 px-2 py-1 text-sm text-ink">{b.hex}</span>
          </span>
        ))}
      </div>
      <button type="button" className="btn btn-ghost btn-sm mt-4" onClick={() => setRevealed((v) => !v)} aria-expanded={revealed}>
        {revealed ? "Hide" : "Decode the handle"}
      </button>
    </section>
  );
}
