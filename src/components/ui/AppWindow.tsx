"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Activity, ArrowLeft, ArrowRight, ChevronRight, FileText, Folder, Mail, Minimize2, Square, X } from "lucide-react";
import { destinations, type DestinationSlug } from "@/config/site";
import { projectBySlug } from "@/data/projects";
import { cn } from "@/lib/cn";

interface Crumb {
  label: string;
  href?: string;
}

interface AppWindowProps {
  /** One of the six files; sets the title bar, path and the neighbouring files. */
  slug?: DestinationSlug;
  /** Chrome for windows that are not one of the six files (the Files app's home view). */
  chrome?: { name: string; app: string; crumbs: Crumb[] };
  title: string;
  lede?: string;
  children: ReactNode;
  wide?: boolean;
}

const APP_ICONS: Record<string, typeof Folder> = {
  Files: Folder,
  "Text Editor": FileText,
  "System Monitor": Activity,
  Mail: Mail,
};

/**
 * The window every app opens in: a title bar ("profile.md — Text Editor") with maximize and
 * close, a path bar, the body and a status bar linking the neighbouring files. Escape closes it
 * (handled globally in GlobalKeys). The entrance is a transform-only CSS animation so
 * server-rendered text is a valid LCP candidate from the first paint.
 */
export function AppWindow({ slug, chrome, title, lede, children, wide }: AppWindowProps) {
  const pathname = usePathname();
  const [max, setMax] = useState(false);
  const index = slug ? destinations.findIndex((d) => d.slug === slug) : -1;
  const current = index >= 0 ? destinations[index] : undefined;
  const prev = current ? destinations[(index + destinations.length - 1) % destinations.length] : undefined;
  const next = current ? destinations[(index + 1) % destinations.length] : undefined;
  const projectSlug = pathname.startsWith("/projects/") ? decodeURIComponent(pathname.split("/")[2] ?? "") : "";
  const project = projectSlug ? projectBySlug(projectSlug) : undefined;

  const name = chrome?.name ?? project?.repo ?? current?.file.replace(/\/$/, "") ?? title;
  const app = chrome?.app ?? current?.app ?? "Files";
  const Icon = APP_ICONS[app] ?? Folder;
  const crumbs: Crumb[] = chrome?.crumbs ?? [
    { label: "~", href: "/" },
    ...(current ? [{ label: current.file.replace(/\/$/, ""), href: project ? current.path : undefined }] : []),
    ...(project ? [{ label: project.repo }] : []),
  ];
  const headingId = `${slug ?? "window"}-title`;

  return (
    <section
      aria-labelledby={headingId}
      className={cn("win panel-enter pointer-events-auto mx-auto mt-[calc(var(--panel-h)+0.75rem)] mb-6 w-[min(100%-1rem,var(--win-w))] sm:mt-[calc(var(--panel-h)+1.25rem)]", max ? "[--win-w:100%]" : wide ? "[--win-w:78rem]" : "[--win-w:64rem]")}
    >
      <div className="win-title">
        <Icon className="win-app size-4" aria-hidden="true" />
        <span className="win-title-text">
          {name} — {app}
        </span>
        <span className="win-ctls">
          <button type="button" className="win-ctl" onClick={() => setMax((v) => !v)} aria-pressed={max} aria-label={max ? "Restore window size" : "Maximize window"}>
            {max ? <Minimize2 className="size-3.5" aria-hidden="true" /> : <Square className="size-3" aria-hidden="true" />}
          </button>
          <Link href="/" className="win-ctl win-ctl-close" aria-label="Close window and return to the desktop">
            <X className="size-3.5" aria-hidden="true" />
          </Link>
        </span>
      </div>

      <nav aria-label="Breadcrumb" className="win-tools">
        <ol className="flex min-w-0 items-center gap-0.5">
          {crumbs.map((c, i) => (
            <li key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-0.5">
              {i > 0 && <ChevronRight className="size-3 shrink-0 text-dust" aria-hidden="true" />}
              {c.href ? (
                <Link href={c.href} className="path-seg">
                  {c.label}
                </Link>
              ) : (
                <span className="path-seg path-current truncate" aria-current="page">
                  {c.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="safe-b p-5 sm:p-8 md:p-10">
        <header className="mb-8 flex flex-col gap-3">
          <h1 id={headingId} className="text-glow text-3xl text-ink sm:text-4xl md:text-5xl">
            {title}
          </h1>
          {lede && <p className="max-w-2xl text-base text-ash sm:text-lg">{lede}</p>}
          <div className="hairline mt-2" />
        </header>

        {children}
      </div>

      <footer className="win-status">
        {prev ? (
          <Link href={prev.path} className="btn btn-ghost btn-sm">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            <span>
              <span className="sr-only">Previous destination: </span>
              {prev.file}
            </span>
          </Link>
        ) : (
          <span />
        )}
        <span className="hidden sm:inline">
          <kbd className="kbd">Esc</kbd> closes · <kbd className="kbd">`</kbd> terminal
        </span>
        {next ? (
          <Link href={next.path} className="btn btn-ghost btn-sm">
            <span>
              <span className="sr-only">Next destination: </span>
              {next.file}
            </span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        ) : (
          <span />
        )}
      </footer>
    </section>
  );
}
