/**
 * Projects: the developer's real public repositories.
 * Every fact here was read from github.com/0x496C6B696E on 2026-10-28.
 * Last-activity and archived state are joined at build time from github.snapshot.json.
 */
export type QuestType = "Automation" | "Data Pipeline" | "Backend Service" | "Systems" | "Tooling" | "Creative";

export interface QuestImage {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}

export interface Quest {
  /** URL slug and GitHub repository name (identical on purpose). */
  slug: string;
  /** Plain, descriptive title. */
  title: string;
  /** Repository name shown as the record name. */
  repo: string;
  type: QuestType;
  language: string;
  summary: string;
  description: string;
  tech: readonly string[];
  highlights: readonly string[];
  license?: string;
  homepage?: string;
  images?: readonly QuestImage[];
}

const GH = "https://github.com/0x496C6B696E";

export const quests: readonly Quest[] = [
  {
    slug: "ai-agent-gunluk-teknoloji-bulteni",
    title: "Daily Hacker News digest agent",
    repo: "ai-agent-gunluk-teknoloji-bulteni",
    type: "Automation",
    language: "JavaScript",
    summary:
      "A self-running n8n workflow that wakes at 08:00, gathers the top 30 Hacker News stories, lets Claude categorise them, writes a Turkish daily digest and delivers it to Telegram.",
    description:
      "The workflow pulls story IDs from the free Hacker News API, fetches each item with batching and retries, and upserts the rows into an n8n Data Table keyed by story id so the first-seen timestamp survives across days. A single Claude Haiku call classifies all 30 titles at once; sorting and counting happen in a Code node and are never left to the model. Claude Sonnet then writes the digest, which is HTML-escaped and split into 4096-character Telegram messages. A separate error workflow reports failures to Telegram, and a bonus MCP server exposes the table as tools to Claude Code, Claude Desktop and Cursor.",
    tech: ["n8n", "JavaScript", "Claude API", "Telegram Bot API", "Hacker News API", "MCP"],
    highlights: [
      "One LLM call for 30 titles, roughly 30 times cheaper than per-item calls, with a JSON-parse fallback to a default category.",
      "Upsert logic keeps first-seen dates stable; a second run never adds rows.",
      "Telegram HTML parse mode with escaping and chunking, three retries per send.",
      "Exported workflow JSON contains no credentials; a repo script scans for leaked API keys and checks that the readable Code-node copies match the JSON.",
    ],
  },
  {
    slug: "AI-Driven-Crawling-Ingestion",
    title: "Books scraper and analysis",
    repo: "AI-Driven-Crawling-Ingestion",
    type: "Data Pipeline",
    language: "Python",
    summary:
      "A polite scraper that walks all 1000 books on books.toscrape.com into a clean CSV, then a pandas + matplotlib analysis asking whether higher-rated books cost more. They do not: r is about 0.03.",
    description:
      "scrape.py follows the next link across 50 listing pages and visits every detail page for category and stock count, fields that only exist there. Prices and star ratings are parsed with small, unit-tested helpers. Each request waits 0.5 s, times out at 15 s and retries up to three times with backoff; a broken book page yields None fields instead of a crash. When the run ends, the row count is checked against the total printed on the site. analiz.py produces three charts and a written answer. The project was built alongside Claude Code with a rule file, a prompt log and a reflection report committed to the repo.",
    tech: ["Python", "requests", "BeautifulSoup", "pandas", "matplotlib", "pytest"],
    highlights: [
      "Three test layers: unit parsers with no network, integration against the live site, and an end-to-end run through a temporary directory.",
      "Ethical defaults: identifying User-Agent, enforced minimum delay, no parallel requests.",
      "Paths resolve relative to the script, so it runs from any working directory and creates its own output folders.",
    ],
    images: [
      {
        src: "/projects/grafik_kategori_fiyat.png",
        alt: "Bar chart of the ten most expensive book categories by average price",
        caption: "Average price per category, limited to categories with at least two books.",
        width: 1350,
        height: 825,
      },
      {
        src: "/projects/grafik_puan_dagilimi.png",
        alt: "Bar chart showing how many books received each star rating from one to five",
        caption: "Distribution of star ratings across 1000 books.",
        width: 1050,
        height: 675,
      },
      {
        src: "/projects/grafik_puan_fiyat.png",
        alt: "Box plot of book prices grouped by star rating",
        caption: "Price by rating with Pearson correlation: essentially flat.",
        width: 1050,
        height: 675,
      },
    ],
  },
  {
    slug: "Restaurant-Management-System",
    title: "Restaurant management backend",
    repo: "Restaurant-Management-System",
    type: "Backend Service",
    language: "Python",
    summary:
      "A Django REST backend for running a restaurant: modular apps for menu, orders, tables, inventory, users, reports, feedback and ads, with JWT auth and Celery workers.",
    description:
      "The backend is organised as eight Django apps, each with its own models, serializers, views and URL module, under a core project with split dev/prod settings, Celery configuration and both WSGI and ASGI entry points. Authentication uses JWT via djangorestframework-simplejwt; the API is documented with drf-yasg (Swagger). Redis backs Celery and django-celery-beat for scheduled work. The repository also carries the operational side: a Dockerfile and Compose files, an nginx config, Kubernetes deployment, service and ingress manifests, a Prometheus config, a Terraform entry point and CI pipeline definitions.",
    tech: ["Python", "Django", "Django REST Framework", "Celery", "Redis", "PostgreSQL", "Docker", "Kubernetes", "Nginx", "Terraform"],
    highlights: [
      "Eight bounded apps: menu, orders, tables, inventory, users, reports, feedback, ads.",
      "Infrastructure as files: Docker, Compose, nginx, Kubernetes, Prometheus and Terraform live beside the code.",
      "Apache-2.0 licensed.",
    ],
    license: "Apache-2.0",
  },
  {
    slug: "CreateOS",
    title: "CreateOS: a from-scratch x86 kernel",
    repo: "CreateOS",
    type: "Systems",
    language: "Assembly / C",
    summary:
      "A from-scratch x86 kernel experiment: a Multiboot assembly stub hands control to a freestanding C kernel that writes straight to VGA text memory, packaged into a GRUB ISO and booted in QEMU.",
    description:
      "boot.s declares the Multiboot header (magic, flags, checksum) and a _start symbol that calls kernel_main, then halts the CPU in a cli/hlt loop. kernel_main writes a greeting directly to the VGA buffer at 0xB8000, one character and one attribute byte at a time. A custom linker script places the sections, and the Makefile drives an i686-elf cross compiler with -ffreestanding and -nostdlib, builds the ISO with grub-mkrescue and boots it with QEMU in a single make run.",
    tech: ["Assembly", "C", "Make", "GRUB", "QEMU", "i686-elf toolchain"],
    highlights: [
      "No libc, no runtime: the whole kernel is a handful of lines you can read in one sitting.",
      "Reproducible boot path: compile, link, ISO, QEMU, all from the Makefile.",
    ],
  },
  {
    slug: "portscanner",
    title: "TCP port scanner",
    repo: "portscanner",
    type: "Tooling",
    language: "C",
    summary:
      "A compact TCP connect scanner in C that walks every port from 1 to 65535 on localhost using BSD sockets, with 100 ms timeouts and a final tally of open gates.",
    description:
      "A single-file exercise in raw socket programming. For each port the scanner opens a socket, sets send and receive timeouts with setsockopt, attempts connect(), reports open ports and closes the descriptor. Progress is printed every 5000 ports and a summary at the end. It is intentionally small: a study of the POSIX socket API rather than a replacement for nmap.",
    tech: ["C", "POSIX sockets"],
    highlights: [
      "Full range scan with bounded per-port latency via SO_RCVTIMEO and SO_SNDTIMEO.",
      "Roughly sixty lines, no dependencies beyond the C standard library and POSIX headers.",
    ],
  },
  {
    slug: "0x496C6B696E",
    title: "Profile README",
    repo: "0x496C6B696E",
    type: "Creative",
    language: "HTML / SVG",
    summary:
      "The GitHub profile README: a hand-drawn SVG masthead, divider and attribute HUD, with generated contribution art published to an output branch. Since replaced by a plain-text profile that points here.",
    description:
      "The profile repository rendered the developer's identity as an illustrated HUD. Masthead, section headings and the attribute sheet were original SVG assets, while contribution snakes and a 3D contribution map were generated on a schedule into a separate output branch so the main branch stayed clean. The assets remain in the repository history; this site now carries the full picture.",
    tech: ["SVG", "HTML", "GitHub Actions"],
    highlights: [
      "Original SVG assets rather than generated badges for the parts that matter.",
      "Generated art is isolated on an output branch.",
    ],
  },
] as const;

export function questBySlug(slug: string): Quest | undefined {
  return quests.find((q) => q.slug === slug);
}

export function questRepoUrl(q: Quest): string {
  return `${GH}/${q.repo}`;
}
