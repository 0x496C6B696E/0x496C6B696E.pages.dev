"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Armchair, Box, Folder, Power, SquareTerminal, Volume2, VolumeX } from "lucide-react";
import { siFirefoxbrowser } from "simple-icons";
import { destinationFor } from "@/config/site";
import { projectBySlug } from "@/data/projects";
import { useExperience } from "@/components/experience/ExperienceProvider";
import { useHum } from "@/lib/useHum";
import { AppsMenu } from "./AppsMenu";

function Clock() {
  const [time, setTime] = useState<string>("");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <time className="panel-clock hidden sm:inline" aria-label="Local time">
      {time}
    </time>
  );
}

/** Title of the window that is open, for the panel's task area. */
function windowTitle(pathname: string): string {
  if (pathname === "/") return "Desktop";
  if (pathname === "/files") return "Home — Files";
  if (pathname === "/browser") return "GitHub — Firefox";
  const d = destinationFor(pathname);
  if (!d) return "Terminal";
  if (pathname.startsWith("/projects/")) {
    const project = projectBySlug(decodeURIComponent(pathname.split("/")[2] ?? ""));
    if (project) return `${project.repo} — Files`;
  }
  return `${d.file.replace(/\/$/, "")} — ${d.app}`;
}

/** The top panel: applications menu, launchers, the open window, then session controls and the clock. */
export function Panel() {
  const { mode, setMode, webgl, terminalOpen, setTerminalOpen, sound, setSound, goToDesk, lock } = useExperience();
  const toDesk = () => {
    if (!immersive) setMode("immersive");
    goToDesk();
  };
  const pathname = usePathname();
  useHum(sound);
  const immersive = mode === "immersive";

  return (
    <nav aria-label="Panel" className="ospanel safe-x">
      <AppsMenu />
      <span className="panel-sep" aria-hidden="true" />
      <Link href="/files" className="panel-btn hidden sm:inline-grid" aria-label="Files" aria-current={pathname === "/files" ? "page" : undefined} title="Files">
        <Folder className="size-4" aria-hidden="true" />
      </Link>
      <button type="button" className="panel-btn" onClick={() => setTerminalOpen(!terminalOpen)} aria-pressed={terminalOpen} aria-label="Terminal" title="Terminal (backtick key)">
        <SquareTerminal className="size-4" aria-hidden="true" />
      </button>
      <Link href="/browser" className="panel-btn hidden sm:inline-grid" aria-label="Firefox: GitHub profile" aria-current={pathname === "/browser" ? "page" : undefined} title="Firefox: GitHub profile">
        <svg viewBox="0 0 24 24" className="size-4" fill={`#${siFirefoxbrowser.hex}`} aria-hidden="true" focusable="false">
          <path d={siFirefoxbrowser.path} />
        </svg>
      </Link>
      <span className="panel-sep" aria-hidden="true" />
      <span className="panel-task" aria-live="polite">
        {windowTitle(pathname)}
      </span>
      {webgl && (
        <button type="button" className="panel-btn panel-btn-text" onClick={toDesk} aria-label="Back to the desk" title={immersive ? "Zoom out to the desk" : "Switch to the 3D room and zoom out to the desk"}>
          <Armchair className="size-4" aria-hidden="true" />
          <span>Desk</span>
        </button>
      )}
      <button
        type="button"
        className="panel-btn"
        onClick={() => setSound(!sound)}
        aria-pressed={sound}
        aria-label="Ambient sound"
        title={sound ? "Ambient sound is on. Mute" : "Play the room: a quiet fan hum synthesised in the browser (no audio files)"}
      >
        {sound ? <Volume2 className="size-4" aria-hidden="true" /> : <VolumeX className="size-4" aria-hidden="true" />}
      </button>
      <button
        type="button"
        className="panel-btn"
        onClick={() => setMode(immersive ? "explorer" : "immersive")}
        disabled={!webgl}
        aria-pressed={immersive}
        aria-label="Immersive mode"
        title={webgl ? (immersive ? "Immersive mode is on. Switch to Explorer mode (no 3D room)" : "Explorer mode is on. Switch to Immersive mode (3D room)") : "WebGL is unavailable on this device, so Explorer mode is used"}
      >
        <Box className="size-4" aria-hidden="true" />
      </button>
      <Clock />
      <button type="button" className="panel-btn" onClick={lock} aria-label="Lock screen" title="Lock screen: back to the room">
        <Power className="size-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
