/**
 * Bonfire Terminal: a small command language over the typed data files.
 * Pure function so it can be unit tested; the component handles history and navigation.
 */
import { destinations, site, type DestinationSlug } from "@/config/site";
import { quests } from "@/data/projects";
import { github, totals } from "@/data/github";
import { formatDate, formatMonth } from "@/lib/format";
import type { Mode } from "@/components/experience/ExperienceProvider";

export interface TerminalContext {
  pathname: string;
  mode: Mode | null;
}

export interface TerminalResult {
  lines: string[];
  /** Route to navigate to, if the command travels. */
  navigate?: string;
  /** Mode to switch to, if the command asks for it. */
  mode?: Mode;
  clear?: boolean;
}

const PROMPT_HELP = [
  "commands:",
  "  help                 this list",
  "  ls                   list destinations",
  "  warp <destination>   travel (e.g. warp projects, warp armament)",
  "  quests               list the quest archive",
  "  open <quest>         open a quest dossier (slug, title word or number)",
  "  whoami               who tends this fire",
  "  stats                soul memory in numbers",
  "  mode [immersive|explorer]",
  "  pwd · rest · clear",
];

function findDestination(query: string): DestinationSlug | undefined {
  const q = query.toLowerCase();
  return destinations.find((d) => d.slug === q || d.label.toLowerCase() === q || d.title.toLowerCase() === q || d.title.toLowerCase().split(" ").includes(q) || d.slug.startsWith(q))?.slug;
}

function findQuest(query: string) {
  const q = query.toLowerCase();
  const index = Number.parseInt(q, 10);
  if (!Number.isNaN(index) && index >= 1 && index <= quests.length) return quests[index - 1];
  return quests.find((x) => x.slug.toLowerCase() === q || x.repo.toLowerCase() === q) ?? quests.find((x) => x.slug.toLowerCase().startsWith(q) || x.title.toLowerCase().includes(q));
}

export function runCommand(input: string, ctx: TerminalContext): TerminalResult {
  const [cmd = "", ...rest] = input.trim().split(/\s+/);
  const arg = rest.join(" ");
  switch (cmd.toLowerCase()) {
    case "":
      return { lines: [] };
    case "help":
    case "?":
      return { lines: PROMPT_HELP };
    case "ls":
      return { lines: destinations.map((d) => `${d.slug.padEnd(9)} ${d.title.padEnd(16)} ${d.label}`) };
    case "pwd":
      return { lines: [ctx.pathname] };
    case "rest":
    case "bonfire":
    case "home":
      return { lines: ["returning to the bonfire"], navigate: "/" };
    case "warp":
    case "cd":
    case "go": {
      if (!arg || arg === "/" || arg === "~") return { lines: ["returning to the bonfire"], navigate: "/" };
      const slug = findDestination(arg);
      if (!slug) return { lines: [`no path named "${arg}". try: ls`] };
      const d = destinations.find((x) => x.slug === slug)!;
      return { lines: [`warping to ${d.title}`], navigate: d.path };
    }
    case "quests":
      return { lines: quests.map((q, i) => `${String(i + 1).padStart(2)}  ${q.slug.padEnd(36)} ${q.title}`) };
    case "open":
    case "cat": {
      if (!arg) return { lines: ["open what? try: quests"] };
      const quest = findQuest(arg);
      if (!quest) return { lines: [`no record matches "${arg}". try: quests`] };
      return { lines: [`opening ${quest.title} (${quest.repo})`], navigate: `/projects/${quest.slug}` };
    }
    case "whoami":
      return { lines: [site.developer.handle, site.developer.title, site.developer.github] };
    case "stats": {
      const u = github.user;
      if (!u) return { lines: ["soul memory is silent in this build"] };
      return {
        lines: [
          `repositories  ${u.publicRepos} public, ${totals.repos} original`,
          `stars         ${totals.stars}`,
          `followers     ${u.followers}`,
          `journey       since ${formatMonth(u.createdAt)}`,
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
      return { lines: [`unknown command: ${cmd}. try: help`] };
  }
}
