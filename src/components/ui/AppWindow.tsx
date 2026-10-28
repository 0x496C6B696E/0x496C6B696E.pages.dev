"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { destinations, type DestinationSlug } from "@/config/site";
import { projectBySlug } from "@/data/projects";
import { cn } from "@/lib/cn";

interface AppWindowProps {
  slug: DestinationSlug;
  title: string;
  lede?: string;
  children: ReactNode;
  wide?: boolean;
}

/**
 * The window every app opens in: title bar with the path and one real close control,
 * body, status line linking the neighbouring apps. Escape closes it (handled globally in GlobalKeys).
 * The entrance is a CSS animation so server-rendered content paints before hydration.
 */
export function AppWindow({ slug, title, lede, children, wide }: AppWindowProps) {
  const pathname = usePathname();
  const index = destinations.findIndex((d) => d.slug === slug);
  const current = destinations[index];
  const prev = destinations[(index + destinations.length - 1) % destinations.length];
  const next = destinations[(index + 1) % destinations.length];
  const projectSlug = pathname.startsWith("/projects/") ? decodeURIComponent(pathname.split("/")[2] ?? "") : "";
  const project = projectSlug ? projectBySlug(projectSlug) : undefined;

  return (
    // Padding (not margin) below the window so its status line can always scroll above the dock.
    <div className="pb-24 md:pb-28">
      <section
        aria-labelledby={`${slug}-title`}
        className={cn("panel panel-enter mx-auto mt-5 w-[min(100%-1.25rem,var(--panel-w))] md:mt-8", wide ? "[--panel-w:78rem]" : "[--panel-w:64rem]")}
      >
        <div className="titlebar">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="winclose" aria-label="Close window and return to the desktop">
              <X className="size-4" aria-hidden="true" />
            </Link>
            <nav aria-label="Breadcrumb" className="min-w-0">
              <ol className="flex min-w-0 items-center gap-1.5">
                <li>
                  <Link href="/" className="transition-colors hover:text-glow">
                    ~
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current={project ? undefined : "page"} className={project ? undefined : "text-glow"}>
                  {project ? (
                    <Link href={current.path} className="transition-colors hover:text-glow">
                      {current.file.replace(/\/$/, "")}
                    </Link>
                  ) : (
                    current.file
                  )}
                </li>
                {project && (
                  <>
                    <li aria-hidden="true">/</li>
                    <li aria-current="page" className="max-w-[16rem] truncate text-glow">
                      {project.repo}
                    </li>
                  </>
                )}
              </ol>
            </nav>
          </div>
          <span className="shrink-0 pr-2 text-[0.68rem] tracking-[0.14em] text-dust uppercase">
            {current.title} · {String(index + 1).padStart(2, "0")}/{String(destinations.length).padStart(2, "0")}
          </span>
        </div>

        <div className="safe-b p-5 sm:p-8 md:p-10">
          <header className="mb-8 flex flex-col gap-3">
            <p className="eyebrow">{current.label}</p>
            <h1 id={`${slug}-title`} className="text-glow text-3xl text-ink sm:text-4xl md:text-5xl">
              {title}
            </h1>
            {lede && <p className="max-w-2xl text-base text-ash sm:text-lg">{lede}</p>}
            <div className="hairline mt-2" />
          </header>

          {children}
        </div>

        <footer className="statusline">
          <Link href={prev.path} className="btn btn-ghost btn-sm">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            <span>
              <span className="sr-only">Previous destination: </span>
              {prev.file}
            </span>
          </Link>
          <span className="hidden sm:inline">
            <kbd className="kbd">Esc</kbd> closes · <kbd className="kbd">`</kbd> terminal
          </span>
          <Link href={next.path} className="btn btn-ghost btn-sm">
            <span>
              <span className="sr-only">Next destination: </span>
              {next.file}
            </span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </footer>
      </section>
    </div>
  );
}
