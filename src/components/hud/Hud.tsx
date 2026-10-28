"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CornerDownLeft, Flame, LayoutGrid, Sparkles, SquareTerminal, Volume2, VolumeX } from "lucide-react";
import { destinationFor, site } from "@/config/site";
import { questBySlug } from "@/data/projects";
import { useExperience } from "@/components/experience/ExperienceProvider";
import { useCrackle } from "@/lib/useCrackle";

export function Hud() {
  const { stage, mode, setMode, webgl, mounted, terminalOpen, setTerminalOpen, sound, setSound } = useExperience();
  const pathname = usePathname();
  const destination = destinationFor(pathname);
  const questSlug = pathname.startsWith("/projects/") ? decodeURIComponent(pathname.split("/")[2] ?? "") : "";
  const quest = questSlug ? questBySlug(questSlug) : undefined;

  useCrackle(sound);

  if (stage === "entry") return null;

  const immersive = mode === "immersive";

  return (
    // The bar itself lets clicks through (waystones can sit under its gradient); only its controls catch them.
    <header className="safe-x pointer-events-none fixed inset-x-0 top-0 z-20 bg-linear-to-b from-abyss/90 via-abyss/60 to-transparent">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 md:h-16">
        <Link href="/" className="group pointer-events-auto flex min-h-11 items-center gap-2.5" aria-label="BonfireOS home: return to the bonfire">
          <Flame className="size-4 text-ember transition-colors group-hover:text-flare" aria-hidden="true" />
          <span className="display text-[0.8rem] tracking-[0.3em] text-ink">BONFIREOS</span>
          <span className="hidden text-xs text-ash lg:inline">· {site.identity}</span>
        </Link>

        <nav aria-label="Breadcrumb" className="pointer-events-auto hidden md:block">
          <ol className="flex items-center gap-2 text-xs tracking-wide text-ash">
            <li>
              <Link href="/" className="transition-colors hover:text-flare">
                Bonfire
              </Link>
            </li>
            {destination && (
              <>
                <li aria-hidden="true">›</li>
                <li aria-current={quest ? undefined : "page"} className={quest ? undefined : "text-ink"}>
                  {quest ? (
                    <Link href={destination.path} className="transition-colors hover:text-flare">
                      {destination.title}
                    </Link>
                  ) : (
                    destination.title
                  )}
                </li>
              </>
            )}
            {quest && (
              <>
                <li aria-hidden="true">›</li>
                <li aria-current="page" className="max-w-[18rem] truncate text-ink">
                  {quest.title}
                </li>
              </>
            )}
          </ol>
        </nav>

        <div className="pointer-events-auto flex items-center gap-1">
          {mounted && (
            <>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setSound(!sound)}
                aria-pressed={sound}
                aria-label="Fire ambience"
                title={sound ? "Fire ambience is on. Mute" : "Play a procedural fire ambience (no audio files)"}
              >
                {sound ? <Volume2 className="size-3.5" aria-hidden="true" /> : <VolumeX className="size-3.5" aria-hidden="true" />}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setTerminalOpen(!terminalOpen)}
                aria-pressed={terminalOpen}
                aria-label="Bonfire terminal"
                title="Open the Bonfire terminal (backtick key)"
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
                title={webgl ? (immersive ? "Immersive mode is on. Switch to Explorer mode (no 3D)" : "Explorer mode is on. Switch to Immersive mode (3D camp)") : "WebGL is unavailable on this device, so the Explorer mode is used"}
              >
                {immersive ? <Sparkles className="size-3.5" aria-hidden="true" /> : <LayoutGrid className="size-3.5" aria-hidden="true" />}
                <span className="hidden sm:inline" aria-hidden="true">
                  {immersive ? "Immersive" : "Explorer"}
                </span>
              </button>
            </>
          )}
          {stage === "panel" && (
            <Link href="/" className="btn btn-ghost btn-sm" aria-label="Return to the bonfire">
              <CornerDownLeft className="size-3.5" aria-hidden="true" />
              <span className="hidden sm:inline" aria-hidden="true">
                Return
              </span>
            </Link>
          )}
        </div>
      </div>
      <div className="hairline opacity-60" />
    </header>
  );
}
