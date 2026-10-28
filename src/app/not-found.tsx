import type { Metadata } from "next";
import Link from "next/link";
import { MonitorPlay } from "lucide-react";

export const metadata: Metadata = { title: "404 · no such file", robots: { index: false } };

export default function NotFound() {
  return (
    <section className="panel mx-auto mt-10 mb-24 w-[min(100%-1.5rem,40rem)]" aria-labelledby="nf-title">
      <div className="titlebar">
        <span>
          <span className="text-flare">sh</span> <span className="text-dust">—</span> exit 404
        </span>
      </div>
      <div className="p-8 text-center md:p-12">
        <p className="eyebrow mb-4">error</p>
        <h1 id="nf-title" className="text-glow text-3xl text-ink sm:text-4xl">
          No such file or directory
        </h1>
        <p className="mt-4 font-mono text-sm text-ash">The path you typed is not mounted on this machine. The desktop is still where you left it.</p>
        <Link href="/" className="btn btn-primary mt-8">
          <MonitorPlay className="size-4" aria-hidden="true" />
          Back to the desktop
        </Link>
      </div>
    </section>
  );
}
