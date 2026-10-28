"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutGrid, MonitorSmartphone, SquareTerminal, Volume2, VolumeX } from "lucide-react";
import { destinationFor, destinations, site } from "@/config/site";
import { DestinationIcon } from "@/components/ui/DestinationIcon";
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
    <time className="hidden px-2 font-mono text-xs text-ash md:inline" aria-label="Local time">
      {time}
    </time>
  );
}

/** Floating dock: home, the six apps, terminal, then sound, mode and the clock. Hidden on the lock screen. */
export function Dock() {
  const { stage, mode, setMode, webgl, mounted, terminalOpen, setTerminalOpen, sound, setSound } = useExperience();
  const pathname = usePathname();
  const current = destinationFor(pathname)?.slug;

  useHum(sound);

  if (stage === "lock") return null;

  const immersive = mode === "immersive";

  return (
    <nav aria-label="Dock" className="safe-x pointer-events-none fixed inset-x-0 bottom-3 z-20 flex justify-center sm:bottom-4">
      <div className="dock pointer-events-auto max-w-[calc(100vw-1.5rem)] overflow-x-auto">
        <Link href="/" className="dock-item" aria-label={`${site.name} home: back to the desktop`} aria-current={pathname === "/" ? "page" : undefined}>
          <MonitorSmartphone className="size-4" aria-hidden="true" />
        </Link>
        <span className="dock-sep hidden sm:block" aria-hidden="true" />
        {destinations.map((d) => (
          <Link key={d.slug} href={d.path} className="dock-item hidden sm:inline-grid" aria-label={`${d.title} (${d.file})`} aria-current={current === d.slug ? "page" : undefined} title={d.title}>
            <DestinationIcon icon={d.icon} className="size-4" />
          </Link>
        ))}
        {mounted && (
          <>
            <span className="dock-sep" aria-hidden="true" />
            <button type="button" className="dock-item" onClick={() => setTerminalOpen(!terminalOpen)} aria-pressed={terminalOpen} aria-label="Terminal" title="Terminal (backtick key)">
              <SquareTerminal className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="dock-item"
              onClick={() => setSound(!sound)}
              aria-pressed={sound}
              aria-label="Ambient sound"
              title={sound ? "Ambient sound is on. Mute" : "Play the room: a quiet fan hum synthesised in the browser (no audio files)"}
            >
              {sound ? <Volume2 className="size-4" aria-hidden="true" /> : <VolumeX className="size-4" aria-hidden="true" />}
            </button>
            <button
              type="button"
              className="dock-item"
              onClick={() => setMode(immersive ? "explorer" : "immersive")}
              disabled={!webgl}
              aria-pressed={immersive}
              aria-label="Immersive mode"
              title={webgl ? (immersive ? "Immersive mode is on. Switch to Explorer mode (no 3D room)" : "Explorer mode is on. Switch to Immersive mode (3D room)") : "WebGL is unavailable on this device, so Explorer mode is used"}
            >
              <LayoutGrid className="size-4" aria-hidden="true" />
            </button>
            <Clock />
          </>
        )}
      </div>
    </nav>
  );
}
