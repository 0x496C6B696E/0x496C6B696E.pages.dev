import type { Metadata } from "next";
import Link from "next/link";
import { Flame } from "lucide-react";

export const metadata: Metadata = { title: "Lost in the fog", robots: { index: false } };

export default function NotFound() {
  return (
    <section className="panel safe-b mx-auto my-24 w-[min(100%-1.5rem,40rem)] p-8 text-center md:p-12" aria-labelledby="nf-title">
      <p className="eyebrow mb-4">No path here</p>
      <h1 id="nf-title" className="text-glow text-3xl text-ink sm:text-4xl">
        Lost in the fog
      </h1>
      <p className="mt-4 text-ash">This road leads nowhere the fire can see. The camp is still where you left it.</p>
      <Link href="/" className="btn btn-primary mt-8">
        <Flame className="size-4 text-ember" aria-hidden="true" />
        Return to the bonfire
      </Link>
    </section>
  );
}
