/**
 * Shell commands over the typed data files.
 * Pure function so it can be unit tested; the component handles history and navigation.
 */
import { destinations, site, type DestinationSlug } from "@/config/site";
import { projects } from "@/data/projects";
import { github, totals } from "@/data/github";
import { formatDate, formatMonth } from "@/lib/format";
import type { Mode } from "@/components/experience/ExperienceProvider";

export const PROMPT = `${site.developer.handle.toLowerCase()}@${site.system.toLowerCase()}:~$`;

export interface TerminalContext {
  pathname: string;
  mode: Mode | null;
}

export interface TerminalResult {
  lines: string[];
  /** Route to navigate to, if the command opens something. */
  navigate?: string;
  /** Mode to switch to, if the command asks for it. */
  mode?: Mode;
  clear?: boolean;
}

const HELP = [
  "commands:",
  "  help                 this list",
  "  ls                   list files on the desktop",
  "  cd <file>            open a file (e.g. cd projects, cd about.txt, cd telemetry)",
  "  projects             list repositories",
  "  open <project>       open a project (name, title word or number)",
  "  whoami               who runs this machine",
  "  stats                github.log in numbers",
  "  mode [immersive|explorer]",
  "  pwd · home · clear",
];

function findDestination(query: string): DestinationSlug | undefined {
  const q = query.toLowerCase().replace(/\/$/, "");
  return destinations.find(
    (d) =>
      d.slug === q ||
      d.file.replace(/\/$/, "") === q ||
      d.file.replace(/\.[a-z]+$|\/$/, "") === q ||
      d.label.toLowerCase() === q ||
      d.title.toLowerCase() === q ||
      d.title.toLowerCase().split(" ").includes(q) ||
      d.slug.startsWith(q),
  )?.slug;
}

function findQuest(query: string) {
  const q = query.toLowerCase();
  const index = Number.parseInt(q, 10);
  if (!Number.isNaN(index) && index >= 1 && index <= projects.length) return projects[index - 1];
  return projects.find((x) => x.slug.toLowerCase() === q || x.repo.toLowerCase() === q) ?? projects.find((x) => x.slug.toLowerCase().startsWith(q) || x.title.toLowerCase().includes(q));
}

export function runCommand(input: string, ctx: TerminalContext): TerminalResult {
  const [cmd = "", ...rest] = input.trim().split(/\s+/);
  const arg = rest.join(" ");
  switch (cmd.toLowerCase()) {
    case "":
      return { lines: [] };
    case "help":
    case "?":
      return { lines: HELP };
    case "ls":
    case "dir":
      return { lines: destinations.map((d) => `${d.file.padEnd(13)} ${d.title.padEnd(13)} ${d.label}`) };
    case "pwd":
      return { lines: [ctx.pathname] };
    case "home":
    case "desktop":
      return { lines: ["back to the desktop"], navigate: "/" };
    case "cd":
    case "warp":
    case "go":
    case "open-file": {
      if (!arg || arg === "/" || arg === "~" || arg === "..") return { lines: ["back to the desktop"], navigate: "/" };
      const slug = findDestination(arg);
      if (!slug) return { lines: [`no such file: ${arg}. try: ls`] };
      const d = destinations.find((x) => x.slug === slug)!;
      return { lines: [`opening ${d.file}`], navigate: d.path };
    }
    case "projects":
    case "repos":
      return { lines: projects.map((q, i) => `${String(i + 1).padStart(2)}  ${q.repo.padEnd(36)} ${q.title}`) };
    case "open":
    case "cat": {
      if (!arg) return { lines: ["open what? try: projects"] };
      const project = findQuest(arg);
      if (!project) return { lines: [`no project matches "${arg}". try: projects`] };
      return { lines: [`opening ${project.repo}`], navigate: `/projects/${project.slug}` };
    }
    case "whoami":
      return { lines: [site.developer.handle, site.developer.title, site.developer.github] };
    case "stats":
    case "uptime": {
      const u = github.user;
      if (!u) return { lines: ["github.log is empty in this build"] };
      return {
        lines: [
          `repositories  ${u.publicRepos} public, ${totals.repos} original`,
          `stars         ${totals.stars}`,
          `followers     ${u.followers}`,
          `online since  ${formatMonth(u.createdAt)}`,
          `snapshot      ${formatDate(github.fetchedAt)}`,
        ],
      };
    }
    case "mode": {
      if (!arg) return { lines: [`mode: ${ctx.mode ?? "unknown"}`] };
      if (arg === "immersive" || arg === "explorer") return { lines: [`mode -> ${arg}`], mode: arg };
      return { lines: ["usage: mode immersive|explorer"] };
    }
    case "clear":
    case "cls":
      return { lines: [], clear: true };
    default:
      return { lines: [`${cmd}: command not found. try: help`] };
  }
}
