/**
 * Character Sheet: engineering abilities as RPG attributes.
 * Levels are a thematic self-assessment adapted from the developer's own profile HUD,
 * NOT certifications or benchmarks. The UI says so explicitly.
 */
export interface Attribute {
  key: string;
  /** RPG attribute name. */
  name: string;
  /** What it really means. */
  meaning: string;
  description: string;
  level: number;
  tech: readonly string[];
  /** Where this shows up in public work. */
  evidence: readonly { label: string; href: string }[];
}

const GH = "https://github.com/0x496C6B696E";

export const attributes: readonly Attribute[] = [
  {
    key: "vigor",
    name: "Vigor",
    meaning: "Reliability",
    description: "Services that keep running after the fire goes out: retries with backoff, timeouts, idempotent writes, error channels that reach a human.",
    level: 88,
    tech: ["Linux", "Docker", "Retry and timeout design", "Structured logging"],
    evidence: [
      { label: "Error workflow and retries in the HN digest", href: `${GH}/ai-agent-gunluk-teknoloji-bulteni` },
      { label: "Timeout, retry and None-not-crash rules in the scraper", href: `${GH}/AI-Driven-Crawling-Ingestion` },
    ],
  },
  {
    key: "mind",
    name: "Mind",
    meaning: "Backend Engineering",
    description: "APIs and services written to be read, not just run. Typed boundaries, clear modules, documented endpoints.",
    level: 90,
    tech: ["Python", "Django / DRF", "FastAPI", "Node.js", "REST", "JWT"],
    evidence: [{ label: "Eight-app Django REST backend", href: `${GH}/Restaurant-Management-System` }],
  },
  {
    key: "endurance",
    name: "Endurance",
    meaning: "Infrastructure",
    description: "Linux, containers, reverse proxies and the manifests that keep them standing through long nights.",
    level: 85,
    tech: ["Linux", "Docker", "Nginx", "Kubernetes", "Terraform", "Git"],
    evidence: [{ label: "Docker, nginx, Kubernetes, Prometheus and Terraform files", href: `${GH}/Restaurant-Management-System/tree/main/infrastructure` }],
  },
  {
    key: "strength",
    name: "Strength",
    meaning: "Systems Programming",
    description: "Close to the metal: C, assembly, sockets, linker scripts, and the discipline of no undefined behaviour.",
    level: 70,
    tech: ["C", "Rust", "Assembly", "Make", "QEMU"],
    evidence: [
      { label: "Multiboot kernel booted in QEMU", href: `${GH}/CreateOS` },
      { label: "TCP connect scanner with POSIX sockets", href: `${GH}/portscanner` },
    ],
  },
  {
    key: "dexterity",
    name: "Dexterity",
    meaning: "Automation",
    description: "Scheduled jobs, bots and pipelines that remove the boring parts, and tell you when they fail.",
    level: 82,
    tech: ["n8n", "Bash", "Python scripting", "Celery Beat", "Telegram bots"],
    evidence: [{ label: "Daily Hacker News to Claude to Telegram automation", href: `${GH}/ai-agent-gunluk-teknoloji-bulteni` }],
  },
  {
    key: "intelligence",
    name: "Intelligence",
    meaning: "Architecture",
    description: "Clean architecture, small diffs, boundaries that match the problem. Decisions written down next to the code.",
    level: 92,
    tech: ["Clean architecture", "Modular design", "Typed configuration", "Documentation"],
    evidence: [
      { label: "Design decisions documented per node", href: `${GH}/ai-agent-gunluk-teknoloji-bulteni/tree/main/docs` },
      { label: "Rule file and reflection report for AI-assisted work", href: `${GH}/AI-Driven-Crawling-Ingestion` },
    ],
  },
  {
    key: "arcane",
    name: "Arcane",
    meaning: "Security",
    description: "Security-minded by default: credential-free exports, secret scanning, token auth, and knowing which ports are open.",
    level: 74,
    tech: ["JWT auth", "Secret hygiene", "Port scanning", "Least privilege"],
    evidence: [
      { label: "API-key scan script and credential-free workflow JSON", href: `${GH}/ai-agent-gunluk-teknoloji-bulteni` },
      { label: "Port scanner", href: `${GH}/portscanner` },
    ],
  },
] as const;

/** The developer's stated principles, from the profile README. */
export const creed: readonly { title: string; text: string }[] = [
  { title: "Written to be read", text: "APIs, tooling and automation, written to be read, not just run." },
  { title: "Small diffs", text: "Clean architecture, small diffs, no undefined behaviour." },
  { title: "Outlast the fire", text: "Build services that keep running long after the bonfire has gone out." },
  { title: "Levelling", text: "Distributed systems, security and performance." },
] as const;
