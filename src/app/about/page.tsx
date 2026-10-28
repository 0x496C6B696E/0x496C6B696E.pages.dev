import type { Metadata } from "next";
import Image from "next/image";
import { Mail } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { TechIcon } from "@/components/ui/TechIcon";
import { SigilDecoder } from "@/components/about/SigilDecoder";
import { site } from "@/config/site";
import { github } from "@/data/github";
import { formatMonth } from "@/lib/format";

export const metadata: Metadata = {
  title: "The Tarnished · About",
  description: `${site.developer.handle}, ${site.developer.title.toLowerCase()}: backend systems, APIs, automation, Linux and infrastructure, reliability and security-minded engineering.`,
  alternates: { canonical: "/about" },
};

const interests = [
  { title: "Backend systems", text: "Services with clear boundaries that stay up and stay readable." },
  { title: "APIs and services", text: "REST endpoints with typed contracts, documented and versioned." },
  { title: "Automation", text: "Scheduled workflows and bots that remove toil and report when they fail." },
  { title: "Linux and infrastructure", text: "Shells, containers, reverse proxies and the manifests that hold them." },
  { title: "Reliability and performance", text: "Timeouts, retries, idempotency, and measuring before optimising." },
  { title: "Security-minded engineering", text: "Credentials out of code, least privilege, scanning for leaks." },
  { title: "Clean architecture", text: "Small diffs, boring solutions, decisions written down next to the code." },
];

export default function AboutPage() {
  const since = github.user?.createdAt ?? site.developer.since;
  return (
    <Panel slug="about" title="The Tarnished" lede="Every world has someone who keeps the fire lit. This one is a backend and systems engineer.">
      <div className="grid gap-10 md:grid-cols-[15rem_1fr] md:gap-12">
        <aside className="flex flex-col items-start gap-5">
          <div className="relative size-36 rounded-full border border-gold/40 p-1 shadow-ember">
            <Image src="/avatar.jpg" alt={`GitHub avatar of ${site.developer.handle}`} width={256} height={256} className="size-full rounded-full object-cover" priority />
          </div>
          <div>
            <p className="font-mono text-sm tracking-wider text-flare">{site.developer.handle}</p>
            <p className="display mt-1 text-lg text-ink">{site.developer.title}</p>
            <p className="mt-2 text-sm text-ash">On GitHub since {formatMonth(since)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={site.developer.github} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
              <TechIcon icon="siGithub" name="GitHub" className="size-3.5" />
              GitHub
            </a>
            <a href={`mailto:${site.developer.email}`} className="btn btn-sm btn-ghost">
              <Mail className="size-3.5" aria-hidden="true" />
              Email
            </a>
          </div>
        </aside>

        <div className="flex flex-col gap-10">
          <section aria-labelledby="chronicle">
            <h2 id="chronicle" className="eyebrow mb-4">
              Chronicle · in the developer&apos;s own words
            </h2>
            <ul className="prose-bonfire grid gap-3">
              {site.developer.creed.map((line) => (
                <li key={line} className="flex gap-3">
                  <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-ember shadow-[0_0_8px_rgb(229_108_53/0.9)]" aria-hidden="true" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="interests">
            <h2 id="interests" className="eyebrow mb-4">
              Fields of study
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {interests.map((item) => (
                <li key={item.title} className="card p-4">
                  <h3 className="display text-[0.95rem] text-ink">{item.title}</h3>
                  <p className="mt-1.5 text-sm text-ash">{item.text}</p>
                </li>
              ))}
            </ul>
          </section>

          <SigilDecoder handle={site.developer.handle} />
        </div>
      </div>
    </Panel>
  );
}
