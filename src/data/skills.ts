/**
 * Capabilities: engineering disciplines with a thematic self-assessed level.
 * Levels are adapted from the developer's own former profile HUD, NOT certifications or
 * benchmarks. The UI says so explicitly.
 */
export interface Attribute {
  key: string;
  /** Discipline name. */
  name: string;
  /** One-line definition of what the discipline covers here. */
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
    key: "reliability",
    name: "Reliability",
    meaning: "keeping services up",
    description: "Retries with backoff, timeouts, idempotent writes and error channels that reach a human. Services that keep running after everyone has gone home.",
    level: 88,
    tech: ["Linux", "Docker", "Retry and timeout design", "Structured logging"],
    evidence: [
      { label: "Error workflow and retries in the HN digest", href: `${GH}/ai-agent-gunluk-teknoloji-bulteni` },
      { label: "Timeout, retry and None-not-crash rules in the scraper", href: `${GH}/AI-Driven-Crawling-Ingestion` },
    ],
  },
  {
    key: "backend",
    name: "Backend",
    meaning: "APIs and services",
    description: "APIs and services written to be read, not just run. Typed boundaries, clear modules, documented endpoints.",
    level: 90,
    tech: ["Python", "Django / DRF", "FastAPI", "Node.js", "REST", "JWT"],
    evidence: [{ label: "Eight-app Django REST backend", href: `${GH}/Restaurant-Management-System` }],
  },
  {
    key: "infrastructure",
    name: "Infrastructure",
    meaning: "containers, proxies, manifests",
    description: "Linux, containers, reverse proxies and the manifests that keep them standing through long nights.",
    level: 85,
    tech: ["Linux", "Docker", "Nginx", "Kubernetes", "Terraform", "Git"],
    evidence: [{ label: "Docker, nginx, Kubernetes, Prometheus and Terraform files", href: `${GH}/Restaurant-Management-System/tree/main/infrastructure` }],
  },
  {
    key: "systems",
    name: "Systems",
    meaning: "close to the metal",
    description: "C, assembly, sockets, linker scripts, and the discipline of no undefined behaviour.",
    level: 70,
    tech: ["C", "Rust", "Assembly", "Make", "QEMU"],
    evidence: [
      { label: "Multiboot kernel booted in QEMU", href: `${GH}/CreateOS` },
      { label: "TCP connect scanner with POSIX sockets", href: `${GH}/portscanner` },
    ],
  },
  {
    key: "automation",
    name: "Automation",
    meaning: "scheduled work that reports back",
    description: "Scheduled jobs, bots and pipelines that remove the boring parts, and tell you when they fail.",
    level: 82,
    tech: ["n8n", "Bash", "Python scripting", "Celery Beat", "Telegram bots"],
    evidence: [{ label: "Daily Hacker News to Claude to Telegram automation", href: `${GH}/ai-agent-gunluk-teknoloji-bulteni` }],
  },
  {
    key: "architecture",
    name: "Architecture",
    meaning: "boundaries and decisions",
    description: "Clean architecture, small diffs, boundaries that match the problem. Decisions written down next to the code.",
    level: 92,
    tech: ["Clean architecture", "Modular design", "Typed configuration", "Documentation"],
    evidence: [
      { label: "Design decisions documented per node", href: `${GH}/ai-agent-gunluk-teknoloji-bulteni/tree/main/docs` },
      { label: "Rule file and reflection report for AI-assisted work", href: `${GH}/AI-Driven-Crawling-Ingestion` },
    ],
  },
  {
    key: "security",
    name: "Security",
    meaning: "secrets, auth, exposure",
    description: "Security-minded by default: credential-free exports, secret scanning, token auth, and knowing which ports are open.",
    level: 74,
    tech: ["JWT auth", "Secret hygiene", "Port scanning", "Least privilege"],
    evidence: [
      { label: "API-key scan script and credential-free workflow JSON", href: `${GH}/ai-agent-gunluk-teknoloji-bulteni` },
      { label: "Port scanner", href: `${GH}/portscanner` },
    ],
  },
] as const;

/** The developer's stated principles. */
export const creed: readonly { title: string; text: string }[] = [
  { title: "Written to be read", text: "APIs, tooling and automation, written to be read, not just run." },
  { title: "Small diffs", text: "Clean architecture, small diffs, no undefined behaviour." },
  { title: "Outlast the shift", text: "Build services that keep running long after everyone has gone home." },
  { title: "Levelling up", text: "Distributed systems, security and performance." },
] as const;
