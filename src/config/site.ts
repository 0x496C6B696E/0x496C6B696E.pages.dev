/**
 * Central, typed configuration for everything personal or deployment-specific.
 * Edit this file; nothing else in the app hard-codes identity or hostnames.
 */
export const site = {
  name: "BONFIREOS",
  shortName: "BonfireOS",
  tagline: "Rest at the Bonfire. Build. Deploy. Repeat.",
  identity: "Backend · Systems · Automation",
  description:
    "An immersive dark-fantasy portfolio for 0x496C6B696E, backend & systems engineer. Explore real projects, skills, tooling and GitHub activity around a bonfire.",
  /** Production origin. Override with NEXT_PUBLIC_SITE_URL at build time. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://bonfireos.pages.dev").replace(/\/$/, ""),
  locale: "en",
  developer: {
    handle: "0x496C6B696E",
    title: "Backend & Systems Engineer",
    github: "https://github.com/0x496C6B696E",
    email: "0x496c6b696e@proton.me",
    /** Verbatim lines from the public profile README (the only hand-written text there). */
    creed: [
      "Backend & systems engineer. I build services that keep running long after the bonfire has gone out.",
      "Currently forging: APIs, tooling and automation, written to be read, not just run.",
      "Levelling: distributed systems, security and performance.",
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
  /** Fantasy name shown in the world. */
  title: string;
  /** Plain label so recruiters always know what it is. */
  label: string;
  blurb: string;
  /** Key resolved to a lucide icon in components/ui/DestinationIcon.tsx */
  icon: "scroll" | "swords" | "book" | "shield" | "gem" | "signpost";
}

export const destinations: readonly Destination[] = [
  { slug: "about", path: "/about", title: "The Tarnished", label: "About", blurb: "Who tends this fire, and why.", icon: "scroll" },
  { slug: "skills", path: "/skills", title: "Character Sheet", label: "Skills", blurb: "Attributes, forged in production.", icon: "swords" },
  { slug: "projects", path: "/projects", title: "Quest Archive", label: "Projects", blurb: "Chronicles of what was actually built.", icon: "book" },
  { slug: "stack", path: "/stack", title: "Armament", label: "Tech Stack", blurb: "Weapons, spells, armour and runes.", icon: "shield" },
  { slug: "stats", path: "/stats", title: "Soul Memory", label: "GitHub Activity", blurb: "Public numbers, taken at build time.", icon: "gem" },
  { slug: "contact", path: "/contact", title: "Summon Signs", label: "Contact", blurb: "Leave a sign. Most are answered.", icon: "signpost" },
] as const;

export function destinationFor(pathname: string): Destination | undefined {
  return destinations.find((d) => pathname === d.path || pathname.startsWith(d.path + "/"));
}
