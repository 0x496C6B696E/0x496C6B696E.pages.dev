import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { AppWindow } from "@/components/ui/AppWindow";
import { FolderGlyph } from "@/components/os/FileGlyph";
import { projects } from "@/data/projects";
import { github, repoByName } from "@/data/github";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Projects",
  description: "Real public projects by 0x496C6B696E: n8n automation with Claude and Telegram, a tested Python scraper and analysis, a Django REST backend, an x86 kernel experiment and a C port scanner.",
  alternates: { canonical: "/projects" },
};

/** The projects folder in the Files app: one folder per repository, in a detailed list. */
export default function ProjectsPage() {
  const snapshotDate = formatDate(github.fetchedAt);
  return (
    <AppWindow slug="projects" title="Projects" lede="Six public repositories, one folder each. Open one for the full write-up." wide>
      <p className="mb-4 font-mono text-xs text-dust">
        {projects.length} items{snapshotDate ? ` · last push from github.log, snapshot ${snapshotDate}` : ""}
      </p>
      <div className="file-list">
        <div className="file-list-head" aria-hidden="true">
          <span />
          <span>Name</span>
          <span className="hidden md:block">Type</span>
          <span className="hidden lg:block">Language</span>
          <span className="hidden sm:block">Last push</span>
        </div>
        <ul>
          {projects.map((q) => {
            const repo = repoByName(q.repo);
            return (
              <li key={q.slug}>
                <Link href={`/projects/${q.slug}`} className="file-row">
                  <FolderGlyph className="glyph-md" />
                  <span className="min-w-0">
                    <span className="block truncate font-mono text-[0.85rem] text-ink">{q.repo}</span>
                    <span className="block truncate text-sm text-ash">{q.title}</span>
                  </span>
                  <span className="hidden text-sm text-ash md:block">{q.type}</span>
                  <span className="hidden text-sm text-ash lg:block">{q.language}</span>
                  <span className="hidden font-mono text-xs text-dust sm:flex sm:items-center sm:gap-2">
                    {repo ? formatDate(repo.pushedAt) : ""}
                    {repo && repo.stars > 0 && (
                      <span className="inline-flex items-center gap-1 text-glow">
                        <Star className="size-3" aria-hidden="true" />
                        {repo.stars}
                        <span className="sr-only">stars</span>
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </AppWindow>
  );
}
