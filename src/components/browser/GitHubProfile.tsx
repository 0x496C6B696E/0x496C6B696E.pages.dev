import Link from "next/link";
import { ExternalLink, GitFork, Star, Users } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { TechIcon } from "@/components/ui/TechIcon";
import { FolderGlyph } from "@/components/os/FileGlyph";
import { site } from "@/config/site";
import { github, languageShares, recentRepos, totals } from "@/data/github";
import { projects } from "@/data/projects";
import { formatDate, formatMonth, formatNumber } from "@/lib/format";

/**
 * The GitHub profile as a page inside the browser window. github.com itself refuses to be
 * framed, so this view is built from the same public data the rest of the machine uses, with
 * one real link out to github.com for everything else.
 */
export function GitHubProfile() {
  const user = github.user;
  const shares = languageShares(6);
  const recent = recentRepos(8).filter((r) => !r.fork);

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-12">
      <aside className="flex flex-col gap-4">
        <Avatar size={256} priority className="size-40 rounded-full border border-edge lg:size-64" />
        <div>
          <p className="display text-2xl text-ink">{user?.name ?? site.developer.handle}</p>
          <p className="font-mono text-base text-ash">{site.developer.handle}</p>
        </div>
        {(user?.bio ?? site.developer.bio) && <p className="text-sm text-ink/90">{user?.bio ?? site.developer.bio}</p>}
        <a href={site.developer.github} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
          <TechIcon icon="siGithub" name="GitHub" className="size-3.5" />
          Open on github.com
          <span className="sr-only">(opens in a new tab)</span>
        </a>
        {user && (
          <p className="flex items-center gap-2 text-sm text-ash">
            <Users className="size-4" aria-hidden="true" />
            <span>
              <strong className="text-ink">{formatNumber(user.followers)}</strong> followers · <strong className="text-ink">{formatNumber(user.following)}</strong> following
            </span>
          </p>
        )}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <dt className="text-ash">Repositories</dt>
          <dd className="text-ink">{user ? formatNumber(user.publicRepos) : projects.length}</dd>
          <dt className="text-ash">Stars received</dt>
          <dd className="text-ink">{formatNumber(totals.stars)}</dd>
          <dt className="text-ash">Joined</dt>
          <dd className="text-ink">{formatMonth(user?.createdAt ?? site.developer.since)}</dd>
          <dt className="text-ash">Mail</dt>
          <dd className="truncate text-ink">
            <Link href="/contact" className="underline decoration-accent/40 underline-offset-2 hover:decoration-accent">
              {site.developer.email}
            </Link>
          </dd>
        </dl>
        {shares.length > 0 && (
          <section aria-labelledby="gh-languages">
            <h2 id="gh-languages" className="eyebrow mb-2">
              Languages
            </h2>
            <div className="flex h-2 overflow-hidden rounded-full bg-white/5" aria-hidden="true">
              {shares.map((l, i) => (
                <span key={l.name} style={{ width: `${l.percent}%`, opacity: 1 - i * 0.12 }} className="bg-accent" />
              ))}
            </div>
            <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-ash">
              {shares.map((l) => (
                <li key={l.name}>
                  {l.name} <span className="text-dust">{l.percent.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </aside>

      <div className="flex flex-col gap-10">
        <section aria-labelledby="gh-pinned">
          <h2 id="gh-pinned" className="eyebrow mb-3">
            Pinned
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {projects.map((p) => (
              <li key={p.slug} className="card card-interactive">
                <Link href={`/projects/${p.slug}`} className="flex h-full flex-col gap-2 p-4">
                  <span className="flex items-center gap-2 font-mono text-sm text-glow">
                    <FolderGlyph className="glyph-sm-folder" />
                    <span className="truncate">{p.repo}</span>
                  </span>
                  <span className="line-clamp-2 text-sm text-ash">{p.summary}</span>
                  <span className="mt-auto flex items-center gap-3 pt-1 text-xs text-dust">
                    <span className="inline-flex items-center gap-1">
                      <span className="size-2.5 rounded-full bg-accent" aria-hidden="true" />
                      {p.language}
                    </span>
                    <span>{p.type}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {recent.length > 0 && (
          <section aria-labelledby="gh-recent">
            <h2 id="gh-recent" className="eyebrow mb-3">
              Repositories, most recent push first
            </h2>
            <ul className="divide-y divide-white/5 rounded-lg border border-white/7">
              {recent.map((r) => {
                const project = projects.find((p) => p.repo === r.name);
                return (
                  <li key={r.name} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm">
                    {project ? (
                      <Link href={`/projects/${project.slug}`} className="font-mono text-glow hover:underline">
                        {r.name}
                      </Link>
                    ) : (
                      <a href={r.htmlUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-mono text-glow hover:underline">
                        {r.name}
                        <ExternalLink className="size-3" aria-hidden="true" />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    )}
                    {r.description && <span className="min-w-0 flex-1 truncate text-ash">{r.description}</span>}
                    <span className="ml-auto flex items-center gap-3 font-mono text-xs text-dust">
                      {r.language && <span>{r.language}</span>}
                      {r.stars > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Star className="size-3" aria-hidden="true" />
                          {r.stars}
                          <span className="sr-only">stars</span>
                        </span>
                      )}
                      {r.forks > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <GitFork className="size-3" aria-hidden="true" />
                          {r.forks}
                          <span className="sr-only">forks</span>
                        </span>
                      )}
                      <span>{formatDate(r.pushedAt)}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
            {github.fetchedAt && <p className="mt-2 font-mono text-xs text-dust">Snapshot {formatDate(github.fetchedAt)}; the avatar is live.</p>}
          </section>
        )}
      </div>
    </div>
  );
}
