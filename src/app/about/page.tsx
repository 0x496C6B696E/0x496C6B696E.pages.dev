import type { Metadata } from "next";
import Image from "next/image";
import { Mail } from "lucide-react";
import { AppWindow } from "@/components/ui/AppWindow";
import { TechIcon } from "@/components/ui/TechIcon";
import { HandleDecoder } from "@/components/about/HandleDecoder";
import { site } from "@/config/site";
import { github, languageShares, totals } from "@/data/github";
import { projects } from "@/data/projects";
import { formatMonth, yearsBetween } from "@/lib/format";

export const metadata: Metadata = {
  title: "Profile · About",
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

const method = [
  { step: "01", title: "Read first", text: "Understand the system end to end before touching it. Most bugs are a misunderstanding wearing a stack trace." },
  { step: "02", title: "Small diffs", text: "Change one thing, make it reviewable, ship it. Big rewrites hide big regressions." },
  { step: "03", title: "Boring over clever", text: "Standard library before dependency, platform before framework. Clever is what someone decodes at 3am." },
  { step: "04", title: "Keep it running", text: "Timeouts, retries, logs that say what happened, and an error channel that reaches a human." },
];

export default function AboutPage() {
  const since = github.user?.createdAt ?? site.developer.since;
  const years = yearsBetween(since);
  const numbers: Array<{ value: string; label: string }> = [
    { value: String(projects.length), label: "public projects" },
    { value: String(languageShares(50).length), label: "languages across repos" },
    { value: years === 0 ? "<1" : String(years), label: years === 1 ? "year on GitHub" : "years on GitHub" },
    { value: String(totals.stars), label: totals.stars === 1 ? "star received" : "stars received" },
  ];
  return (
    <AppWindow slug="about" title="Profile" lede="The operator of this machine: a backend and systems engineer who likes services that outlive their on-call shift.">
      <div className="grid gap-10 md:grid-cols-[15rem_1fr] md:gap-12">
        <aside className="flex flex-col items-start gap-5">
          <div className="relative size-36 rounded-md border border-accent/40 p-1 shadow-glow">
            <Image src="/avatar.jpg" alt={`GitHub avatar of ${site.developer.handle}`} width={256} height={256} className="size-full rounded-sm object-cover" priority />
          </div>
          <div>
            <p className="font-mono text-sm tracking-wider text-glow">{site.developer.handle}</p>
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
          <section aria-labelledby="numbers">
            <h2 id="numbers" className="sr-only">
              By the numbers
            </h2>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {numbers.map((n) => (
                <li key={n.label} className="card px-4 py-3">
                  <p className="display text-glow text-2xl text-ink">{n.value}</p>
                  <p className="text-[0.7rem] tracking-wide text-ash">{n.label}</p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="readme">
            <h2 id="readme" className="eyebrow mb-4">
              readme · in the developer&apos;s own words
            </h2>
            <ul className="prose grid gap-3">
              {site.developer.creed.map((line) => (
                <li key={line} className="flex gap-3">
                  <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_8px_rgb(94_225_255/0.8)]" aria-hidden="true" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="interests">
            <h2 id="interests" className="eyebrow mb-4">
              Interests
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

          <section aria-labelledby="method">
            <h2 id="method" className="eyebrow mb-4">
              Method · how the work gets done
            </h2>
            <ol className="grid gap-3 sm:grid-cols-2">
              {method.map((m) => (
                <li key={m.step} className="card flex gap-4 p-4">
                  <span className="display text-2xl leading-none text-accent/70">{m.step}</span>
                  <div>
                    <h3 className="display text-[0.95rem] text-ink">{m.title}</h3>
                    <p className="mt-1.5 text-sm text-ash">{m.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <HandleDecoder handle={site.developer.handle} />
        </div>
      </div>
    </AppWindow>
  );
}
