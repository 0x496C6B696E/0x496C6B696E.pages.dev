"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { useExperience } from "@/components/experience/ExperienceProvider";
import { runCommand, PROMPT } from "@/lib/terminal";
import { site } from "@/config/site";

interface Line {
  kind: "in" | "out";
  text: string;
}

const WELCOME: Line[] = [{ kind: "out", text: `${site.name} ${site.system.toLowerCase()} shell. type "help" to list commands.` }];

/**
 * A shell over the same typed data the windows use. Opens with the backtick key or the
 * taskbar button; Escape closes it (and does not bubble to the window's Escape handler).
 */
export function Terminal() {
  const { terminalOpen, setTerminalOpen, mode, setMode } = useExperience();
  const router = useRouter();
  const pathname = usePathname();
  const [lines, setLines] = useState<Line[]>(WELCOME);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const log = useRef<HTMLDivElement>(null);

  // Global shortcut: backtick toggles, unless the user is typing somewhere else.
  useEffect(() => {
    const onKey = (event: KeyboardEvent | globalThis.KeyboardEvent) => {
      if (event.key !== "`" || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && target !== input.current && target.closest("input, textarea, [contenteditable=true]")) return;
      event.preventDefault();
      setTerminalOpen(!terminalOpen);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [terminalOpen, setTerminalOpen]);

  useEffect(() => {
    if (terminalOpen) input.current?.focus();
  }, [terminalOpen]);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [lines]);

  if (!terminalOpen) return null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const command = value.trim();
    if (!command) return;
    const result = runCommand(command, { pathname, mode });
    setHistory((h) => [command, ...h].slice(0, 50));
    setCursor(-1);
    setValue("");
    setLines((prev) => (result.clear ? [] : [...prev, { kind: "in", text: command }, ...result.lines.map((text) => ({ kind: "out" as const, text }))]));
    if (result.mode) setMode(result.mode);
    if (result.navigate) router.push(result.navigate);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setTerminalOpen(false);
      return;
    }
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const next = event.key === "ArrowUp" ? Math.min(cursor + 1, history.length - 1) : Math.max(cursor - 1, -1);
      setCursor(next);
      setValue(next === -1 ? "" : history[next]);
    }
  };

  return (
    <section
      aria-label="Terminal"
      data-keeps-escape
      className="panel fixed inset-x-2 bottom-14 z-30 mx-auto flex max-h-[min(60dvh,28rem)] w-[min(100%-1rem,56rem)] flex-col font-mono text-[0.8rem] text-ink shadow-ember sm:inset-x-4 sm:bottom-16"
    >
      <header className="titlebar">
        <span>
          <span className="text-flare">sh</span> <span className="text-dust">—</span> {PROMPT}
        </span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTerminalOpen(false)} aria-label="Close terminal">
          <X className="size-3.5" aria-hidden="true" />
        </button>
      </header>
      <div ref={log} role="log" aria-live="polite" className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-4 py-3 leading-6">
        {lines.map((line, i) => (
          <div key={i} className={line.kind === "in" ? "text-flare" : "whitespace-pre-wrap text-ash"}>
            {line.kind === "in" ? `${PROMPT} ${line.text}` : line.text}
          </div>
        ))}
      </div>
      <form onSubmit={submit} className="flex items-center gap-2 border-t border-edge px-4 py-2">
        <label htmlFor="terminal-input" className="shrink-0 text-gold">
          {PROMPT}
        </label>
        <input
          ref={input}
          id="terminal-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          className="min-h-9 w-full bg-transparent text-ink outline-none placeholder:text-dust"
          placeholder="help"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-describedby="terminal-hint"
        />
        <span id="terminal-hint" className="sr-only">
          Type a command and press Enter. Up and down arrows recall history. Escape closes the terminal.
        </span>
      </form>
    </section>
  );
}
