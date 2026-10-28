"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { FileGlyph, fileExt } from "./FileGlyph";

const TRASH = ["final_v7_really_final.zip", "idea_not_ready_yet.txt", "fix_tomorrow.patch", "node_modules (1 of 3).tar"];

/** The Trash: a small window with things that were deleted on purpose. Emptying it is the only feature. */
export function TrashWindow({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [items, setItems] = useState(TRASH);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    root.current?.focus();
    // Escape closes the Trash wherever focus is (the emptied button loses focus when it is disabled).
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <section
      ref={root}
      role="dialog"
      aria-labelledby="trash-title"
      tabIndex={-1}
      data-keeps-escape
      className="win panel-enter fixed top-[calc(var(--panel-h)+1rem)] left-1/2 z-30 w-[min(100%-1.5rem,26rem)] -translate-x-1/2 outline-none"
    >
      <header className="win-title">
        <span className="win-title-text" id="trash-title">
          Trash — Files
        </span>
        <span className="win-ctls">
          <button type="button" className="win-ctl win-ctl-close" onClick={onClose} aria-label="Close Trash">
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </span>
      </header>
      <div className="p-4">
        {items.length > 0 ? (
          <ul className="grid gap-1">
            {items.map((item) => (
              <li key={item} className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm text-ink">
                <FileGlyph ext={fileExt(item)} className="glyph-sm" />
                <span className="truncate font-mono text-[0.8rem]">{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-2 py-6 text-center text-sm text-ash" role="status">
            Trash is empty. The bugs are still in the backlog, though.
          </p>
        )}
      </div>
      <footer className="win-status">
        <span>{items.length === 1 ? "1 item" : `${items.length} items`}</span>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => {
            setItems([]);
            root.current?.focus();
          }}
          disabled={items.length === 0}
        >
          Empty trash
        </button>
      </footer>
    </section>
  );
}
