"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Armchair, Folder, Lock, SquareTerminal } from "lucide-react";
import { siFirefoxbrowser, siKalilinux } from "simple-icons";
import { destinations } from "@/config/site";
import { DestinationIcon } from "@/components/ui/DestinationIcon";
import { useExperience } from "@/components/experience/ExperienceProvider";

/** The applications menu at the left end of the panel. */
export function AppsMenu() {
  const { mode, goToDesk, lock, setTerminalOpen } = useExperience();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    root.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      root.current?.querySelector<HTMLElement>("button")?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={root} className="relative" data-keeps-escape>
      <button type="button" className="panel-btn panel-apps" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? "apps-menu" : undefined} aria-label="Applications">
        <svg viewBox="0 0 24 24" className="size-[1.15rem]" fill="currentColor" aria-hidden="true" focusable="false">
          <path d={siKalilinux.path} />
        </svg>
      </button>
      {open && (
        <div id="apps-menu" role="menu" aria-label="Applications" className="apps-menu">
          <p className="menu-h">Favourites</p>
          <Link href="/files" role="menuitem" className="menu-item" onClick={close}>
            <Folder className="size-4 text-accent" aria-hidden="true" />
            Files
          </Link>
          <button
            type="button"
            role="menuitem"
            className="menu-item"
            onClick={() => {
              setTerminalOpen(true);
              close();
            }}
          >
            <SquareTerminal className="size-4 text-accent" aria-hidden="true" />
            Terminal
          </button>
          <Link href="/browser" role="menuitem" className="menu-item" onClick={close}>
            <svg viewBox="0 0 24 24" className="size-4" fill={`#${siFirefoxbrowser.hex}`} aria-hidden="true" focusable="false">
              <path d={siFirefoxbrowser.path} />
            </svg>
            Firefox
            <span className="ml-auto text-xs text-dust">GitHub</span>
          </Link>
          <p className="menu-h">Files</p>
          {destinations.map((d) => (
            <Link key={d.slug} href={d.path} role="menuitem" className="menu-item" onClick={close}>
              <DestinationIcon icon={d.icon} className="size-4 text-accent" />
              {d.file}
              <span className="ml-auto text-xs text-dust">{d.title}</span>
            </Link>
          ))}
          <p className="menu-h">Session</p>
          {mode === "immersive" && (
            <button
              type="button"
              role="menuitem"
              className="menu-item"
              onClick={() => {
                close();
                goToDesk();
              }}
            >
              <Armchair className="size-4 text-accent" aria-hidden="true" />
              Back to the desk
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            className="menu-item"
            onClick={() => {
              close();
              lock();
            }}
          >
            <Lock className="size-4 text-accent" aria-hidden="true" />
            Lock screen
          </button>
        </div>
      )}
    </div>
  );
}
