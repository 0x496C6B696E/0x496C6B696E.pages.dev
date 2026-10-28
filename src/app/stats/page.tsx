import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { TechIcon } from "@/components/ui/TechIcon";
import { site } from "@/config/site";
import { github, languageShares, recentRepos, totals } from "@/data/github";
import { formatDate, formatMonth, formatNumber, yearsBetween } from "@/lib/format";

export const metadata: Metadata = {
  title: "Soul Memory · GitHub Activity",
  description: "Verifiable public GitHub statistics for 0x496C6B696E, captured at build time: repositories, stars, followers, language mix and recent activity.",
  alternates: { canonical: "/stats" },
};

export default function StatsPage() {
  const user = github.user;
  const snapshotDate = formatDate(github.fetchedAt);
  const languages = languageShares(8);
  const recent = recentRepos(5);

  if (!user) {
    return (
      <Panel slug="stats" title="Soul Memory" lede="Public GitHub numbers, captured when the site was built.">
        <div className="card p-6">
          <h2 className="display text-xl text-ink">The archive is silent</h2>
          <p className="mt-2 text-sm text-ash">
            The GitHub API could not be reached during this build, so no statistics are shown rather than showing stale or invented ones.
          </p>
          <a href={site.developer.github} target="_blank" rel="noopener noreferrer" className="btn mt-5">
            <TechIcon icon="siGithub" name="GitHub" className="size-4" />
            Open the GitHub profile
          </a>
        </div>
      </Panel>
    );
  }

  const years = yearsBetween(user.createdAt);
  const cards: Array<{ label: string; value: string; note: string }> = [
    { label: "Public repositories", value: formatNumber(user.publicRepos), note: `${totals.repos} original, ${user.publicRepos - totals.repos} forked` },
    { label: "Stars received", value: formatNumber(totals.stars), note: "across original repositories" },
    { label: "Phantoms", value: formatNumber(user.followers), note: `followers · following ${formatNumber(user.following)}` },
    { label: "Journey began", value: formatMonth(user.createdAt), note: years === 1 ? "one year on GitHub" : `${years} years on GitHub` },
  ];

  return (
    <Panel slug="stats" title="Soul Memory" lede="Public GitHub numbers, captured when the site was built. Nothing here is estimated." wide>
      <p className="mb-6 text-xs text-dust">
        Snapshot taken {snapshotDate} from the public GitHub API · no authentication, no tracking, no live requests from your browser.
      </p>

      <section aria-labelledby="totals">
        <h2 id="totals" className="sr-only">
          Totals
        </h2>
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {cards.map((c) => (
            <li key={c.label} className="card flex flex-col gap-1 p-4 sm:p-5">
              <p className="text-[0.65rem] tracking-[0.2em] text-gold uppercase">{c.label}</p>
              <p className="display text-glow text-2xl text-ink sm:text-3xl">{c.value}</p>
              <p className="text-xs text-ash">{c.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <section aria-labelledby="languages" className="card p-5">
          <h2 id="languages" className="eyebrow mb-4">
            Tongues spoken · bytes per language
          </h2>
          {languages.length === 0 ? (
            <p className="text-sm text-ash">No language data in this snapshot.</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {languages.map((l) => (
                <li key={l.name}>
                  <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-ink">{l.name}</span>
                    <span className="font-mono text-xs text-ash">{l.percent}%</span>
                  </div>
                  <div className="statbar" role="img" aria-label={`${l.name}: ${l.percent} percent of code bytes`}>
                    <span style={{ width: `${Math.max(l.percent, 1)}%` }} />
                  </div>
                </li>
              ))}
            </ol>
          )}
          <p className="mt-4 text-xs text-dust">Summed over original repositories only; forks are excluded.</p>
        </section>

        <section aria-labelledby="recent" className="card p-5">
          <h2 id="recent" className="eyebrow mb-4">
            Recent embers · last pushed
          </h2>
          <ol className="flex flex-col divide-y divide-gold/10">
            {recent.map((r) => (
              <li key={r.name} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
                <div className="flex items-baseline justify-between gap-3">
                  <a href={r.htmlUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-flare underline decoration-gold/30 underline-offset-4 hover:decoration-gold">
                    {r.name}
                  </a>
                  <time dateTime={r.pushedAt} className="shrink-0 text-xs text-ash">
                    {formatDate(r.pushedAt)}
                  </time>
                </div>
                <p className="text-xs text-ash">
                  {r.language ?? "Mixed"}
                  {r.description ? ` · ${r.description}` : ""}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-xs text-dust">
          Contribution graphs and GitHub achievements require authenticated GraphQL access, so they are left out instead of being approximated.
        </p>
        <a href={user.htmlUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
          <TechIcon icon="siGithub" name="GitHub" className="size-3.5" />
          Verify on GitHub
          <ExternalLink className="size-3" aria-hidden="true" />
        </a>
      </div>
    </Panel>
  );
}
