import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Star } from "lucide-react";
import { AppWindow } from "@/components/ui/AppWindow";
import { TechIcon } from "@/components/ui/TechIcon";
import { projectBySlug, projectRepoUrl, projects } from "@/data/projects";
import { repoByName } from "@/data/github";
import { formatDate } from "@/lib/format";

export function generateStaticParams() {
  return projects.map((q) => ({ slug: q.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) return {};
  return {
    title: `${project.title} · ${project.repo}`,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: project.title, description: project.summary },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();
  const repo = repoByName(project.repo);
  const repoUrl = projectRepoUrl(project);

  const facts: Array<[string, string]> = [
    ["Repository", project.repo],
    ["Type", project.type],
    ["Language", project.language],
  ];
  if (project.license ?? repo?.license) facts.push(["Licence", project.license ?? repo!.license!]);
  if (repo) {
    facts.push(["Last push", formatDate(repo.pushedAt)]);
    facts.push(["Status", repo.archived ? "Archived" : "Active"]);
  }

  return (
    <AppWindow slug="projects" title={project.title} lede={project.summary} wide>
      <Link href="/projects" className="mb-6 inline-flex min-h-11 items-center gap-2 font-mono text-sm text-ash transition-colors hover:text-glow">
        <ArrowLeft className="size-4" aria-hidden="true" />
        cd ..
        <span className="sr-only">back to projects</span>
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1fr_18rem]">
        <article className="flex flex-col gap-8">
          <section aria-labelledby="overview">
            <h2 id="overview" className="eyebrow mb-3">
              Overview
            </h2>
            <div className="prose text-[0.98rem]">
              <p>{project.description}</p>
            </div>
          </section>

          <section aria-labelledby="highlights">
            <h2 id="highlights" className="eyebrow mb-3">
              Highlights
            </h2>
            <ul className="grid gap-2.5">
              {project.highlights.map((h) => (
                <li key={h} className="flex gap-3 text-sm text-ink/90">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  {h}
                </li>
              ))}
            </ul>
          </section>

          {project.images && project.images.length > 0 && (
            <section aria-labelledby="figures">
              <h2 id="figures" className="eyebrow mb-3">
                Figures
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {project.images.map((img) => (
                  <figure key={img.src} className="card overflow-hidden">
                    <Image src={img.src} alt={img.alt} width={img.width} height={img.height} className="h-auto w-full bg-ink" sizes="(min-width: 1024px) 420px, 100vw" />
                    <figcaption className="p-3 text-xs text-ash">{img.caption}</figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}
        </article>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
          <dl className="card grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 p-5 text-sm">
            {facts.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="font-mono text-xs tracking-wider text-accent uppercase">{k}</dt>
                <dd className={k === "Repository" ? "font-mono text-xs break-words text-ink [overflow-wrap:anywhere]" : "text-ink"}>{v}</dd>
              </div>
            ))}
            {repo && repo.stars > 0 && (
              <div className="contents">
                <dt className="font-mono text-xs tracking-wider text-accent uppercase">Stars</dt>
                <dd className="inline-flex items-center gap-1 text-ink">
                  <Star className="size-3.5 text-glow" aria-hidden="true" />
                  {repo.stars}
                </dd>
              </div>
            )}
          </dl>

          <section aria-labelledby="built-with">
            <h2 id="built-with" className="eyebrow mb-3">
              Built with
            </h2>
            <ul className="flex flex-wrap gap-1.5">
              {project.tech.map((t) => (
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
            {(project.homepage ?? repo?.homepage) && (
              <a href={project.homepage ?? repo!.homepage!} target="_blank" rel="noopener noreferrer" className="btn">
                <ExternalLink className="size-4" aria-hidden="true" />
                Live demo
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
          </div>
        </aside>
      </div>
    </AppWindow>
  );
}
