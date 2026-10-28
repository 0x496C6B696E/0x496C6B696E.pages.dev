"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Info } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { AttributeRadar } from "./AttributeRadar";
import { attributes, creed } from "@/data/skills";

const TABS = [
  { id: "attributes", label: "Capabilities" },
  { id: "creed", label: "Creed" },
] as const;

export function CharacterSheet() {
  const [tab, setTab] = useState<string>("attributes");
  const [grown, setGrown] = useState(false);

  // Bars grow from zero after mount; CSS handles the easing and reduced motion.
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setGrown(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs tabs={TABS} value={tab} onChange={setTab} label="Capability sections" />
        <p className="flex items-start gap-2 text-xs text-ash sm:max-w-sm">
          <Info className="mt-0.5 size-3.5 shrink-0 text-gold" aria-hidden="true" />
          Levels are a self-assessment, not certifications or benchmarks. Evidence links point to public repositories.
        </p>
      </div>

      <div role="tabpanel" id="panel-attributes" aria-labelledby="tab-attributes" hidden={tab !== "attributes"} className="grid gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2 lg:grid lg:grid-cols-[22rem_1fr] lg:gap-4">
          <AttributeRadar />
          <div className="card mt-4 flex flex-col justify-center gap-3 p-5 lg:mt-0">
            <h2 className="display text-lg text-ink">How to read this</h2>
            <p className="text-sm text-ash">
              Each entry is an engineering discipline with the developer&apos;s own estimate of depth, so compare the shape, not the digits: the profile leans toward
              backend work, architecture and reliability, with systems programming and security as the areas currently being levelled up.
            </p>
            <p className="text-sm text-ash">Every card below links to a public repository where that capability was actually exercised.</p>
          </div>
        </div>
        {attributes.map((a) => (
          <article key={a.key} className="card p-5">
            <header className="flex items-baseline justify-between gap-4">
              <h2 className="display text-lg text-ink">
                {a.name} <span className="font-mono text-xs font-normal text-gold">· {a.meaning}</span>
              </h2>
              <span className="font-mono text-sm text-flare" aria-label={`Level ${a.level} of 100`}>
                {a.level}
                <span className="text-dust">/100</span>
              </span>
            </header>
            <div className="statbar mt-3" role="img" aria-label={`${a.name}: ${a.level} of 100, self-assessed`}>
              <span style={{ width: grown ? `${a.level}%` : "0%" }} />
            </div>
            <p className="mt-3 text-sm text-ash">{a.description}</p>
            <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={`Technologies for ${a.name}`}>
              {a.tech.map((t) => (
                <li key={t} className="tag">
                  {t}
                </li>
              ))}
            </ul>
            <ul className="mt-3 flex flex-col gap-1" aria-label={`Evidence for ${a.name}`}>
              {a.evidence.map((e) => (
                <li key={e.href + e.label}>
                  <a href={e.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-flare underline decoration-gold/40 underline-offset-4 hover:decoration-gold">
                    {e.label}
                    <ExternalLink className="size-3" aria-hidden="true" />
                    <span className="sr-only">(opens GitHub in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div role="tabpanel" id="panel-creed" aria-labelledby="tab-creed" hidden={tab !== "creed"} className="grid gap-4 sm:grid-cols-2">
        {creed.map((c) => (
          <blockquote key={c.title} className="card p-5">
            <h2 className="display text-base text-ink">{c.title}</h2>
            <p className="mt-2 text-sm text-ash italic">“{c.text}”</p>
          </blockquote>
        ))}
        <p className="text-xs text-dust sm:col-span-2">Adapted from the developer&apos;s own profile notes.</p>
      </div>
    </div>
  );
}
