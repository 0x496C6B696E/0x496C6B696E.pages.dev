"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, type KeyboardEvent } from "react";
import { destinations, site } from "@/config/site";
import { BrowserGlyph, EntryGlyph, TrashGlyph } from "./FileGlyph";

interface Entry {
  key: string;
  name: string;
  label: string;
  glyph: React.ReactNode;
  href?: string;
  external?: boolean;
  onClick?: () => void;
}

/**
 * The icons on the desktop, in a column at the left like a Linux desktop (a grid on phones).
 * Folders first (Home, projects), then the files, then the browser and the Trash.
 */
export function DesktopIcons({ onTrash }: { onTrash: () => void }) {
  const pathname = usePathname();
  const list = useRef<HTMLElement>(null);

  const entries: Entry[] = [
    { key: "home", name: "Home", label: "Home (Files)", glyph: <EntryGlyph file="Home/" className="glyph-lg" />, href: "/files" },
    { key: "projects", name: "projects", label: "projects (Files)", glyph: <EntryGlyph file="projects/" className="glyph-lg" />, href: "/projects" },
    ...destinations
      .filter((d) => d.slug !== "projects")
      .map((d) => ({ key: d.slug, name: d.file, label: `${d.file} (${d.app})`, glyph: <EntryGlyph file={d.file} className="glyph-lg" />, href: d.path })),
    { key: "firefox", name: "Firefox", label: "Firefox (GitHub profile, opens in a new tab)", glyph: <BrowserGlyph className="glyph-lg" />, href: site.developer.github, external: true },
    { key: "trash", name: "Trash", label: "Trash", glyph: <TrashGlyph className="glyph-lg" />, onClick: onTrash },
  ];

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
    if (!keys.includes(event.key)) return;
    const items = Array.from(list.current?.querySelectorAll<HTMLElement>(".desk-icon") ?? []);
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (index === -1) return;
    event.preventDefault();
    const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
    items[(index + (forward ? 1 : items.length - 1)) % items.length]?.focus();
  };

  const current = (href?: string) => href && !href.startsWith("http") && (pathname === href || pathname.startsWith(href + "/"));

  return (
    <nav ref={list} aria-label="Destinations" className="desk-icons" data-window={pathname !== "/"} onKeyDown={onKeyDown}>
      {entries.map((e) =>
        e.onClick ? (
          <button key={e.key} type="button" className="desk-icon" onClick={e.onClick} aria-label={e.label}>
            {e.glyph}
            <span>{e.name}</span>
          </button>
        ) : e.external ? (
          <a key={e.key} href={e.href} target="_blank" rel="noopener noreferrer" className="desk-icon" aria-label={e.label}>
            {e.glyph}
            <span>{e.name}</span>
          </a>
        ) : (
          <Link key={e.key} href={e.href!} className="desk-icon" aria-label={e.label} aria-current={current(e.href) ? "page" : undefined}>
            {e.glyph}
            <span>{e.name}</span>
          </Link>
        ),
      )}
    </nav>
  );
}
