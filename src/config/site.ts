/**
 * Central, typed configuration for everything personal or deployment-specific.
 * Edit this file; nothing else in the app hard-codes identity or hostnames.
 */
export const site = {
  /** Wordmark shown in the UI and page titles. */
  name: "0x496C6B696E",
  shortName: "0x496C6B696E",
  /** The machine the portfolio pretends to be. */
  system: "WORKSTATION",
  version: "2.0",
  tagline: "Boot. Build. Deploy. Repeat.",
  identity: "Backend · Systems · Automation",
  description:
    "The workstation of 0x496C6B696E, backend & systems engineer. Power on the machine and open the files: real projects, capabilities, toolchain, GitHub telemetry and mail.",
  /** Production origin. Override with NEXT_PUBLIC_SITE_URL at build time. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://0x496c6b696e.pages.dev").replace(/\/$/, ""),
  locale: "en",
  developer: {
    handle: "0x496C6B696E",
    title: "Backend & Systems Engineer",
    github: "https://github.com/0x496C6B696E",
    email: "0x496c6b696e@proton.me",
    /** The developer's own lines. */
    creed: [
      "Backend & systems engineer. I build services that keep running long after everyone has gone home.",
      "Currently building: APIs, tooling and automation, written to be read, not just run.",
      "Levelling up: distributed systems, security and performance.",
      "Ask me about: Linux, Git, Docker, Python, TypeScript, Rust.",
      "Creed: clean architecture, small diffs, no undefined behaviour.",
    ],
    /** From the public GitHub profile bio. */
    bio: "Full-Stack Engineer & Data Analyst | Specializing in web development, backend systems, automation, and data analytics.",
    since: "2023-05-25",
  },
} as const;

export type DestinationSlug = "about" | "skills" | "projects" | "stack" | "stats" | "contact";

export interface Destination {
  slug: DestinationSlug;
  path: `/${DestinationSlug}`;
  /** App name shown in windows, on the desktop and in the dock. */
  title: string;
  /** Plain label so recruiters always know what it is. */
  label: string;
  /** File name shown under the desktop icon and in the window path. */
  file: string;
  blurb: string;
  /** Key resolved to a lucide icon in components/ui/DestinationIcon.tsx */
  icon: "profile" | "skills" | "projects" | "stack" | "stats" | "mail";
}

export const destinations: readonly Destination[] = [
  { slug: "about", path: "/about", title: "Profile", label: "About", file: "profile.md", blurb: "Who runs this machine, and how.", icon: "profile" },
  { slug: "skills", path: "/skills", title: "Capabilities", label: "Skills", file: "skills.json", blurb: "Seven disciplines, each tied to shipped code.", icon: "skills" },
  { slug: "projects", path: "/projects", title: "Projects", label: "Projects", file: "projects/", blurb: "Six public repositories with full write-ups.", icon: "projects" },
  { slug: "stack", path: "/stack", title: "Toolchain", label: "Tech Stack", file: "stack.yaml", blurb: "Languages, frameworks, infrastructure, tools.", icon: "stack" },
  { slug: "stats", path: "/stats", title: "Telemetry", label: "GitHub Activity", file: "github.log", blurb: "Public numbers captured at build time.", icon: "stats" },
  { slug: "contact", path: "/contact", title: "Mail", label: "Contact", file: "mail.eml", blurb: "Two verified channels, no forms.", icon: "mail" },
] as const;

export function destinationFor(pathname: string): Destination | undefined {
  return destinations.find((d) => pathname === d.path || pathname.startsWith(d.path + "/"));
}
