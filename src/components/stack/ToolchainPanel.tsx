"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { TechIcon } from "@/components/ui/TechIcon";
import { toolchain, type ToolCategory } from "@/data/stack";
import { cn } from "@/lib/cn";

const TABS = toolchain.map((g) => ({ id: g.key, label: g.title }));

export function ToolchainPanel() {
  const [category, setCategory] = useState<ToolCategory>("languages");
  const [selected, setSelected] = useState<string>(toolchain[0].items[0].name);

  const group = toolchain.find((g) => g.key === category)!;
  const item = group.items.find((i) => i.name === selected) ?? group.items[0];

  const changeCategory = (id: string) => {
    const next = toolchain.find((g) => g.key === id)!;
    setCategory(next.key);
    setSelected(next.items[0].name);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Tabs tabs={TABS} value={category} onChange={changeCategory} label="Toolchain categories" />
        <p className="text-sm text-ash">
          <span className="text-accent">{group.subtitle}.</span> {group.flavor}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div role="tabpanel" id={`panel-${group.key}`} aria-labelledby={`tab-${group.key}`}>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5" aria-label={`${group.title} entries`}>
          {group.items.map((it) => {
            const active = it.name === item.name;
            return (
              <li key={it.name}>
                <button
                  type="button"
                  onClick={() => setSelected(it.name)}
                  aria-pressed={active}
                  aria-controls="armory-inspect"
                  className={cn(
                    "card card-interactive flex min-h-24 w-full flex-col items-center justify-center gap-2 p-3 text-center",
                    active && "border-accent/60 shadow-glow",
                  )}
                >
                  <span className={cn("grid size-9 place-items-center transition-colors", active ? "text-glow" : "text-ink/80")}>
                    <TechIcon icon={it.icon} name={it.name} className="size-7" />
                  </span>
                  <span className="text-[0.72rem] leading-tight text-ink">{it.name}</span>
                </button>
              </li>
            );
          })}
          </ul>
        </div>

        <aside id="armory-inspect" key={item.name} className="card rise-in flex flex-col gap-3 p-5 [animation-duration:0.3s] lg:sticky lg:top-24 lg:self-start" aria-live="polite">
          <p className="eyebrow">Inspect</p>
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-sm border border-edge bg-void/60 text-glow">
              <TechIcon icon={item.icon} name={item.name} className="size-6" />
            </span>
            <div>
              <h2 className="display text-lg text-ink">{item.name}</h2>
              <p className="text-xs text-accent">
                {group.title} · {group.subtitle}
              </p>
            </div>
          </div>
          <p className="text-sm text-ash">{item.note}</p>
          <div>
            <p className="text-[0.65rem] tracking-[0.2em] text-dust uppercase">Seen in</p>
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {item.source.map((s) => (
                <li key={s} className="tag">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
