import type { Metadata } from "next";
import Link from "next/link";
import { Home, LayoutGrid, FolderGit2, HardDrive } from "lucide-react";
import { AppWindow } from "@/components/ui/AppWindow";
import { EntryGlyph } from "@/components/os/FileGlyph";
import { destinations, site } from "@/config/site";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Home — Files",
  description: `The home folder of ${site.developer.handle}'s workstation: projects, profile, capabilities, toolchain, GitHub telemetry and mail, each a file you can open.`,
  alternates: { canonical: "/files" },
};

/** The Files app opened on the home folder: every file on the machine, folders first. */
export default function FilesPage() {
  const projectsEntry = destinations.find((d) => d.slug === "projects")!;
  const entries = [
    { name: projectsEntry.file, href: projectsEntry.path, meta: `folder · ${projects.length} items`, blurb: projectsEntry.blurb },
    ...destinations.filter((d) => d.slug !== "projects").map((d) => ({ name: d.file, href: d.path, meta: `${d.app.toLowerCase()} · ${d.title}`, blurb: d.blurb })),
  ];

  return (
    <AppWindow chrome={{ name: "Home", app: "Files", crumbs: [{ label: "~" }] }} title="Home" lede="Everything on this machine lives in the home folder. Open a folder or a file." wide>
      <div className="grid gap-8 md:grid-cols-[11rem_1fr] md:gap-10">
        <aside className="files-places" aria-label="Places">
          <p className="files-h">Places</p>
          <ul>
            <li>
              <span className="files-place" aria-current="page">
                <Home className="size-4" aria-hidden="true" />
                Home
              </span>
            </li>
            <li>
              <Link href="/" className="files-place">
                <LayoutGrid className="size-4" aria-hidden="true" />
                Desktop
              </Link>
            </li>
            <li>
              <Link href="/projects" className="files-place">
                <FolderGit2 className="size-4" aria-hidden="true" />
                projects
              </Link>
            </li>
          </ul>
          <p className="files-h">Devices</p>
          <ul>
            <li>
              <span className="files-place text-dust">
                <HardDrive className="size-4" aria-hidden="true" />
                {site.system.toLowerCase()}
              </span>
            </li>
          </ul>
        </aside>

        <div>
          <p className="mb-4 font-mono text-xs text-dust">{entries.length} items</p>
          <ul className="file-grid">
            {entries.map((e) => (
              <li key={e.name}>
                <Link href={e.href} className="file-entry">
                  <EntryGlyph file={e.name} className="glyph-lg" />
                  <span className="file-name">{e.name}</span>
                  <span className="file-meta">{e.meta}</span>
                  <span className="file-blurb">{e.blurb}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppWindow>
  );
}
