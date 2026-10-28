"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutGrid, MonitorPlay, SquareTerminal, Volume2, VolumeX, X } from "lucide-react";
import { destinationFor, site } from "@/config/site";
import { questBySlug } from "@/data/projects";
import { useExperience } from "@/components/experience/ExperienceProvider";
import { useHum } from "@/lib/useHum";

function Clock() {
  const [time, setTime] = useState<string>("");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <time className="hidden font-mono text-xs text-ash sm:inline" aria-label="Local time">
      {time}
    </time>
  );
}

/** Bottom system bar: home, current path, toggles, clock. Hidden on the power-on screen. */
export function Taskbar() {
  const { stage, mode, setMode, webgl, mounted, terminalOpen, setTerminalOpen, sound, setSound } = useExperience();
  const pathname = usePathname();
  const destination = destinationFor(pathname);
  const questSlug = pathname.startsWith("/projects/") ? decodeURIComponent(pathname.split("/")[2] ?? "") : "";
  const quest = questSlug ? questBySlug(questSlug) : undefined;

  useHum(sound);

  if (stage === "entry") return null;

  const immersive = mode === "immersive";
  const path = destination ? `~/${destination.file.replace(/\/$/, "")}${quest ? `/${quest.repo}` : ""}` : "~";

  return (
    <footer className="safe-x pointer-events-none fixed inset-x-0 bottom-0 z-20">
      <div className="pointer-events-auto mx-auto flex h-12 max-w-7xl items-center justify-between gap-3 border-t border-edge bg-abyss/90 px-2 backdrop-blur-sm sm:px-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="group flex min-h-10 shrink-0 items-center gap-2" aria-label={`${site.name} home: back to the desktop`}>
            <span className="grid size-6 place-items-center rounded-sm border border-gold/50 bg-surface text-gold transition-colors group-hover:border-gold group-hover:text-flare" aria-hidden="true">
              <MonitorPlay className="size-3.5" />
            </span>
            <span className="display text-[0.78rem] tracking-[0.12em] text-ink">{site.name}</span>
          </Link>
          <nav aria-label="Breadcrumb" className="hidden min-w-0 md:block">
            <ol className="flex min-w-0 items-center gap-1.5 font-mono text-xs text-ash">
              <li>
                <Link href="/" className="transition-colors hover:text-flare">
                  ~
                </Link>
              </li>
              {destination && (
                <>
                  <li aria-hidden="true">/</li>
                  <li aria-current={quest ? undefined : "page"} className={quest ? undefined : "text-ink"}>
                    {quest ? (
                      <Link href={destination.path} className="transition-colors hover:text-flare">
                        {destination.file.replace(/\/$/, "")}
                      </Link>
                    ) : (
                      destination.file.replace(/\/$/, "")
                    )}
                  </li>
                </>
              )}
              {quest && (
                <>
                  <li aria-hidden="true">/</li>
                  <li aria-current="page" className="max-w-[18rem] truncate text-ink">
                    {quest.repo}
                  </li>
                </>
              )}
            </ol>
          </nav>
          <span className="sr-only">Current path {path}</span>
        </div>

        <div className="flex items-center gap-0.5">
          {mounted && (
            <>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setSound(!sound)}
                aria-pressed={sound}
                aria-label="Ambient sound"
                title={sound ? "Ambient sound is on. Mute" : "Play the room: fan hum and disk clicks synthesised in the browser (no audio files)"}
              >
                {sound ? <Volume2 className="size-3.5" aria-hidden="true" /> : <VolumeX className="size-3.5" aria-hidden="true" />}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setTerminalOpen(!terminalOpen)}
                aria-pressed={terminalOpen}
                aria-label="Terminal"
                title="Open the terminal (backtick key)"
              >
                <SquareTerminal className="size-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setMode(immersive ? "explorer" : "immersive")}
                disabled={!webgl}
                aria-pressed={immersive}
                aria-label="Immersive mode"
                title={webgl ? (immersive ? "Immersive mode is on. Switch to Explorer mode (no 3D room)" : "Explorer mode is on. Switch to Immersive mode (3D room)") : "WebGL is unavailable on this device, so Explorer mode is used"}
              >
                {immersive ? <MonitorPlay className="size-3.5" aria-hidden="true" /> : <LayoutGrid className="size-3.5" aria-hidden="true" />}
                <span className="hidden sm:inline" aria-hidden="true">
                  {immersive ? "Immersive" : "Explorer"}
                </span>
              </button>
              {stage === "panel" && (
                <Link href="/" className="btn btn-ghost btn-sm" aria-label="Close window and return to the desktop">
                  <X className="size-3.5" aria-hidden="true" />
                </Link>
              )}
              <span className="ml-1 hidden h-5 w-px bg-edge sm:inline-block" aria-hidden="true" />
              <span className="hidden pl-2 sm:inline">
                <Clock />
              </span>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
