import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Star } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { TechIcon } from "@/components/ui/TechIcon";
import { questBySlug, questRepoUrl, quests } from "@/data/projects";
import { repoByName } from "@/data/github";
import { formatDate } from "@/lib/format";

export function generateStaticParams() {
  return quests.map((q) => ({ slug: q.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const quest = questBySlug(slug);
  if (!quest) return {};
  return {
    title: `${quest.title} · ${quest.repo}`,
    description: quest.summary,
    alternates: { canonical: `/projects/${quest.slug}` },
    openGraph: { title: quest.title, description: quest.summary },
  };
}

export default async function QuestPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const quest = questBySlug(slug);
  if (!quest) notFound();
  const repo = repoByName(quest.repo);
  const repoUrl = questRepoUrl(quest);

  const facts: Array<[string, string]> = [
    ["Record", quest.repo],
    ["Type", quest.type],
    ["Language", quest.language],
  ];
  if (quest.license ?? repo?.license) facts.push(["Licence", quest.license ?? repo!.license!]);
  if (repo) {
    facts.push(["Last ember", formatDate(repo.pushedAt)]);
    facts.push(["Status", repo.archived ? "Sealed (archived)" : "Open"]);
  }

  return (
    <Panel slug="projects" title={quest.title} lede={quest.summary} wide>
      <Link href="/projects" className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-ash transition-colors hover:text-flare">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to the Quest Archive
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1fr_18rem]">
        <article className="flex flex-col gap-8">
          <section aria-labelledby="record">
            <h2 id="record" className="eyebrow mb-3">
              The record
            </h2>
            <div className="prose-bonfire text-[0.98rem]">
              <p>{quest.description}</p>
            </div>
          </section>

          <section aria-labelledby="notable">
            <h2 id="notable" className="eyebrow mb-3">
              Notable
            </h2>
            <ul className="grid gap-2.5">
              {quest.highlights.map((h) => (
                <li key={h} className="flex gap-3 text-sm text-ink/90">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                  {h}
                </li>
              ))}
            </ul>
          </section>

          {quest.images && quest.images.length > 0 && (
            <section aria-labelledby="artifacts">
              <h2 id="artifacts" className="eyebrow mb-3">
                Artifacts recovered
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {quest.images.map((img) => (
                  <figure key={img.src} className="card overflow-hidden">
                    <Image src={img.src} alt={img.alt} width={img.width} height={img.height} className="h-auto w-full bg-ink" sizes="(min-width: 1024px) 420px, 100vw" />
                    <figcaption className="p-3 text-xs text-ash">{img.caption}</figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}
        </article>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <dl className="card grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 p-5 text-sm">
            {facts.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-xs tracking-wider text-gold uppercase">{k}</dt>
                <dd className={k === "Record" ? "font-mono text-xs break-words text-ink [overflow-wrap:anywhere]" : "text-ink"}>{v}</dd>
              </div>
            ))}
            {repo && repo.stars > 0 && (
              <div className="contents">
                <dt className="text-xs tracking-wider text-gold uppercase">Embers</dt>
                <dd className="inline-flex items-center gap-1 text-ink">
                  <Star className="size-3.5 text-flare" aria-hidden="true" />
                  {repo.stars} <span className="text-ash">stars</span>
                </dd>
              </div>
            )}
          </dl>

          <section aria-labelledby="forged">
            <h2 id="forged" className="eyebrow mb-3">
              Forged with
            </h2>
            <ul className="flex flex-wrap gap-1.5">
              {quest.tech.map((t) => (
                <li key={t} className="tag">
                  {t}
                </li>
              ))}
            </ul>
          </section>

          <div className="flex flex-col gap-2">
            <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              <TechIcon icon="siGithub" name="GitHub" className="size-4" />
              View on GitHub
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            {(quest.homepage ?? repo?.homepage) && (
              <a href={quest.homepage ?? repo!.homepage!} target="_blank" rel="noopener noreferrer" className="btn">
                <ExternalLink className="size-4" aria-hidden="true" />
                Live demo
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
          </div>
        </aside>
      </div>
    </Panel>
  );
}
