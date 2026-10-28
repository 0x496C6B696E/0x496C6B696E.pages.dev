"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { destinations, type DestinationSlug } from "@/config/site";
import { cn } from "@/lib/cn";

interface PanelProps {
  slug: DestinationSlug;
  title: string;
  lede?: string;
  children: ReactNode;
  wide?: boolean;
}

/**
 * The window every destination opens in: title bar with the file name, body, status line.
 * Escape closes it (back to the desktop); the status line links the neighbouring apps.
 * The entrance is a CSS animation so server-rendered content paints before hydration.
 */
export function Panel({ slug, title, lede, children, wide }: PanelProps) {
  const router = useRouter();
  const index = destinations.findIndex((d) => d.slug === slug);
  const current = destinations[index];
  const prev =
    destinations[(index + destinations.length - 1) % destinations.length];
  const next = destinations[(index + 1) % destinations.length];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("dialog, [data-keeps-escape]")) return;
      router.push("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    // Padding (not margin) below the window so its status line can always scroll above the fixed taskbar.
    <div className="pb-20 md:pb-24">
      <section
        aria-labelledby={`${slug}-title`}
        className={cn(
          "panel panel-enter mx-auto mt-6 w-[min(100%-1.5rem,var(--panel-w))] md:mt-10",
          wide ? "[--panel-w:78rem]" : "[--panel-w:64rem]",
        )}
      >
        <div className="titlebar">
          <div className="flex min-w-0 items-center gap-3">
            <span className="dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="truncate">
              <span className="text-flare">{current.file}</span>
              <span className="text-dust"> — </span>
              {current.title}
            </span>
          </div>
          <Link
            href="/"
            className="btn btn-ghost btn-sm"
            aria-label="Close window and return to the desktop"
          >
            <X className="size-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="safe-b p-5 sm:p-8 md:p-10">
          <header className="mb-8 flex flex-col gap-3">
            <p className="eyebrow">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(destinations.length).padStart(2, "0")} · {current.label}
            </p>
            <h1
              id={`${slug}-title`}
              className="text-glow text-3xl text-ink sm:text-4xl md:text-5xl"
            >
              {title}
            </h1>
            {lede && (
              <p className="max-w-2xl text-base text-ash sm:text-lg">{lede}</p>
            )}
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
            <kbd className="kbd">Esc</kbd> closes · <kbd className="kbd">`</kbd>{" "}
            terminal
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
