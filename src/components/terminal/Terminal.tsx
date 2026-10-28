"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { useExperience } from "@/components/experience/ExperienceProvider";
import { runCommand, PROMPT, cwd } from "@/lib/terminal";
import { site } from "@/config/site";

interface Line {
  kind: "in" | "out";
  text: string;
  path?: string;
}

const WELCOME: Line[] = [{ kind: "out", text: `${site.name} ${site.system.toLowerCase()} shell. type "help" to list commands.` }];

/** The two-line prompt: frame, user㉿host, path. */
function Prompt({ path }: { path: string }) {
  return (
    <>
      <span className="t-frame">┌──(</span>
      <span className="t-user">{PROMPT}</span>
      <span className="t-frame">)-[</span>
      <span className="t-path">{path}</span>
      <span className="t-frame">]</span>
      <br />
      <span className="t-frame">└─</span>
      <span className="t-user">$</span>
    </>
  );
}

/**
 * A shell over the same typed data the windows use. Opens with the backtick key, the panel
 * button or the keyboard on the desk; Escape closes it (and does not bubble to the window's Escape handler).
 */
export function Terminal() {
  const { terminalOpen, setTerminalOpen, mode, setMode, stage } = useExperience();
  const router = useRouter();
  const pathname = usePathname();
  const [lines, setLines] = useState<Line[]>(WELCOME);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const path = cwd(pathname);
  const open = terminalOpen && (stage === "desktop" || stage === "window");

  // Global shortcut: backtick toggles, unless the user is typing somewhere else.
  useEffect(() => {
    const onKey = (event: KeyboardEvent | globalThis.KeyboardEvent) => {
      if (event.key !== "`" || event.ctrlKey || event.metaKey || event.altKey) return;
      if (stage === "lock" || stage === "desk") return;
      const target = event.target as HTMLElement | null;
      if (target && target !== input.current && target.closest("input, textarea, [contenteditable=true]")) return;
      event.preventDefault();
      setTerminalOpen(!terminalOpen);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [terminalOpen, setTerminalOpen, stage]);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [lines]);

  if (!open) return null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const command = value.trim();
    if (!command) return;
    const result = runCommand(command, { pathname, mode });
    setHistory((h) => [command, ...h].slice(0, 50));
    setCursor(-1);
    setValue("");
    setLines((prev) => (result.clear ? [] : [...prev, { kind: "in", text: command, path }, ...result.lines.map((text) => ({ kind: "out" as const, text }))]));
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
    <section aria-label="Terminal" data-keeps-escape className="win term fixed inset-x-2 bottom-3 z-30 mx-auto flex max-h-[min(62dvh,30rem)] w-[min(100%-1rem,56rem)] flex-col font-mono text-[0.8rem] sm:inset-x-4 sm:bottom-6">
      <header className="win-title">
        <span className="win-title-text">
          {PROMPT}: {path}
        </span>
        <span className="win-ctls">
          <button type="button" className="win-ctl win-ctl-close" onClick={() => setTerminalOpen(false)} aria-label="Close terminal">
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </span>
      </header>
      <div ref={log} role="log" aria-live="polite" className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-4 py-3 leading-6">
        {lines.map((line, i) => (
          <div key={i} className={line.kind === "in" ? "text-ink" : "whitespace-pre-wrap text-ash"}>
            {line.kind === "in" ? (
              <>
                <Prompt path={line.path ?? path} /> {line.text}
              </>
            ) : (
              line.text
            )}
          </div>
        ))}
      </div>
      <form onSubmit={submit} className="flex items-end gap-2 border-t border-white/5 px-4 py-2 leading-6">
        <label htmlFor="terminal-input" className="shrink-0">
          <span className="sr-only">Terminal command</span>
          <span aria-hidden="true">
            <Prompt path={path} />
          </span>
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
