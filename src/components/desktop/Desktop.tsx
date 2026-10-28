"use client";

import { destinations, site } from "@/config/site";
import { useExperience } from "@/components/experience/ExperienceProvider";
import { projects } from "@/data/projects";
import { github, languageShares } from "@/data/github";
import { formatDate, formatMonth } from "@/lib/format";

/**
 * The home route once the machine is on. The icons and the panel live in <OsShell/> (so they
 * stay behind windows too); this only adds the page heading and a small status line.
 */
export function DesktopHome() {
  const { osReady } = useExperience();
  const snapshot = formatDate(github.fetchedAt);
  const since = formatMonth(github.user?.createdAt);
  const tongues = languageShares(50).length;

  return (
    <div className="min-h-dvh">
      <h1 className="sr-only">
        {site.name} desktop: {destinations.length} files
      </h1>
      <p className="os-gate safe-x fixed right-0 bottom-3 text-right font-mono text-[0.68rem] text-dust" data-ready={osReady} aria-label="System status">
        {projects.length} projects · {tongues} languages{since ? ` · online since ${since}` : ""}
        {snapshot ? ` · github.log ${snapshot}` : ""}
      </p>
    </div>
  );
}
