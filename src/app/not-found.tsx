import type { Metadata } from "next";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { PROMPT } from "@/lib/terminal";

export const metadata: Metadata = { title: "404 · no such file", robots: { index: false } };

export default function NotFound() {
  return (
    <section className="win term pointer-events-auto mx-auto mt-[calc(var(--panel-h)+1.5rem)] mb-10 w-[min(100%-1rem,40rem)]" aria-labelledby="nf-title">
      <div className="win-title">
        <span className="win-title-text">{PROMPT}: ~ — Terminal</span>
      </div>
      <div className="p-6 font-mono text-[0.85rem] leading-7 md:p-8">
        <p>
          <span className="t-frame">┌──(</span>
          <span className="t-user">{PROMPT}</span>
          <span className="t-frame">)-[</span>
          <span className="t-path">~</span>
          <span className="t-frame">]</span>
          <br />
          <span className="t-frame">└─</span>
          <span className="t-user">$</span> <span className="text-ink">cd (the path you typed)</span>
        </p>
        <h1 id="nf-title" className="mt-2 text-[0.95rem] font-medium text-ink">
          No such file or directory
        </h1>
        <p className="mt-1 text-ash">exit 404 · the desktop is still where you left it.</p>
        <Link href="/" className="btn btn-primary mt-8">
          <LayoutGrid className="size-4" aria-hidden="true" />
          Back to the desktop
        </Link>
      </div>
    </section>
  );
}
