"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Flame } from "lucide-react";
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
 * The stone-and-parchment surface every destination renders into.
 * Escape returns to the bonfire; the footer links the neighbouring destinations.
 * The entrance is a CSS animation so server-rendered content paints before hydration.
 */
export function Panel({ slug, title, lede, children, wide }: PanelProps) {
  const router = useRouter();
  const index = destinations.findIndex((d) => d.slug === slug);
  const current = destinations[index];
  const prev = destinations[(index + destinations.length - 1) % destinations.length];
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
    <section
      aria-labelledby={`${slug}-title`}
      className={cn(
        "panel panel-enter safe-b mx-auto my-20 w-[min(100%-1.5rem,var(--panel-w))] p-5 sm:p-8 md:my-24 md:p-10",
        wide ? "[--panel-w:78rem]" : "[--panel-w:64rem]",
      )}
    >
      <header className="mb-8 flex flex-col gap-3">
        <p className="eyebrow">
          Destination {index + 1} of {destinations.length} · {current.label}
        </p>
        <h1 id={`${slug}-title`} className="text-glow text-3xl text-ink sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {lede && <p className="max-w-2xl text-base text-ash sm:text-lg">{lede}</p>}
        <div className="hairline mt-2" />
      </header>

      {children}

      <footer className="mt-12 flex flex-col gap-3 border-t border-gold/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Link href={prev.path} className="btn btn-ghost btn-sm justify-start sm:justify-center">
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          <span>
            <span className="sr-only">Previous destination: </span>
            {prev.title}
          </span>
        </Link>
        <Link href="/" className="btn btn-sm">
          <Flame className="size-3.5 text-ember" aria-hidden="true" />
          Return to the bonfire
        </Link>
        <Link href={next.path} className="btn btn-ghost btn-sm justify-start sm:justify-center">
          <span>
            <span className="sr-only">Next destination: </span>
            {next.title}
          </span>
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </footer>
    </section>
  );
}
