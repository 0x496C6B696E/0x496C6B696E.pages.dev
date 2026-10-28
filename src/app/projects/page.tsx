import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { AppWindow } from "@/components/ui/AppWindow";
import { projects } from "@/data/projects";
import { github, repoByName } from "@/data/github";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Projects",
  description: "Real public projects by 0x496C6B696E: n8n automation with Claude and Telegram, a tested Python scraper and analysis, a Django REST backend, an x86 kernel experiment and a C port scanner.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  const snapshotDate = formatDate(github.fetchedAt);
  return (
    <AppWindow slug="projects" title="Projects" lede="Six public repositories. Open one for the full write-up." wide>
      <p className="mb-6 font-mono text-xs text-dust">
        {projects.length} entries{snapshotDate ? ` · push dates from github.log, snapshot ${snapshotDate}` : ""}
      </p>
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((q) => {
          const repo = repoByName(q.repo);
          return (
            <li key={q.slug} className="card card-interactive flex">
              <Link href={`/projects/${q.slug}`} className="flex h-full w-full flex-col gap-3 p-5">
                <div className="flex items-center justify-between gap-3 font-mono text-[0.68rem] tracking-[0.12em] text-accent uppercase">
                  <span>{q.type}</span>
                  <span className="text-ash normal-case tracking-normal">{q.language}</span>
                </div>
                <h2 className="display text-xl text-ink">{q.title}</h2>
                <p className="font-mono text-xs text-ash">{q.repo}</p>
                <p className="line-clamp-4 text-sm text-ash">{q.summary}</p>
                <ul className="mt-auto flex flex-wrap gap-1.5 pt-2" aria-label="Technologies">
                  {q.tech.slice(0, 4).map((t) => (
                    <li key={t} className="tag">
                      {t}
                    </li>
                  ))}
                  {q.tech.length > 4 && <li className="tag">+{q.tech.length - 4}</li>}
                </ul>
                {repo && (
                  <p className="flex items-center justify-between gap-3 border-t border-edge pt-3 font-mono text-xs text-dust">
                    <span>last push {formatDate(repo.pushedAt)}</span>
                    {repo.stars > 0 && (
                      <span className="inline-flex items-center gap-1 text-glow">
                        <Star className="size-3" aria-hidden="true" />
                        {repo.stars}
                        <span className="sr-only">stars</span>
                      </span>
                    )}
                  </p>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </AppWindow>
  );
}
