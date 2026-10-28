/**
 * Armament: technologies genuinely present in the developer's public profile or repositories.
 * `source` says where each item was observed. Icons are Simple Icons export names (CC0);
 * items without a matching icon fall back to a rune monogram in the UI.
 */
export type ArmamentCategory = "weapons" | "spells" | "armor" | "runes";

export interface ArmamentItem {
  name: string;
  /** Simple Icons export name, e.g. "siPython". Omit for monogram fallback. */
  icon?: string;
  note: string;
  source: readonly string[];
}

export interface ArmamentGroup {
  key: ArmamentCategory;
  title: string;
  subtitle: string;
  flavor: string;
  items: readonly ArmamentItem[];
}

const P = "profile README";
const R = (name: string) => `repo: ${name}`;

export const armament: readonly ArmamentGroup[] = [
  {
    key: "weapons",
    title: "Weapons",
    subtitle: "Programming languages",
    flavor: "What gets drawn first.",
    items: [
      { name: "Python", icon: "siPython", note: "Primary language for backends, scrapers and analysis scripts.", source: [P, R("AI-Driven-Crawling-Ingestion"), R("Restaurant-Management-System")] },
      { name: "TypeScript", icon: "siTypescript", note: "Typed JavaScript for tooling and web work, this site included.", source: [P] },
      { name: "JavaScript", icon: "siJavascript", note: "Code nodes and validation scripts inside automation workflows.", source: [P, R("ai-agent-gunluk-teknoloji-bulteni")] },
      { name: "Rust", icon: "siRust", note: "Systems language on the levelling path: memory safety without a GC.", source: [P] },
      { name: "Go", icon: "siGo", note: "Small, fast services and CLIs.", source: [P] },
      { name: "C", icon: "siC", note: "Kernels, sockets and anything that talks to hardware.", source: [P, R("CreateOS"), R("portscanner")] },
      { name: "C++", icon: "siCplusplus", note: "When C needs abstractions.", source: [P] },
      { name: "Bash", icon: "siGnubash", note: "Glue, automation and server chores.", source: [P] },
      { name: "Assembly", note: "x86 boot stubs and the first instructions a machine runs.", source: [R("CreateOS")] },
    ],
  },
  {
    key: "spells",
    title: "Spells",
    subtitle: "Frameworks & libraries",
    flavor: "Incantations that do a lot with a few words.",
    items: [
      { name: "FastAPI", icon: "siFastapi", note: "Typed, async Python APIs with generated docs.", source: [P] },
      { name: "Django", icon: "siDjango", note: "Batteries-included web framework behind the restaurant backend.", source: [R("Restaurant-Management-System")] },
      { name: "Django REST Framework", note: "Serializers, viewsets and JWT auth for the API layer.", source: [R("Restaurant-Management-System")] },
      { name: "Celery", icon: "siCelery", note: "Background jobs and scheduled tasks with Redis as broker.", source: [R("Restaurant-Management-System")] },
      { name: "Node.js", icon: "siNodedotjs", note: "Server-side JavaScript runtime.", source: [P] },
      { name: "React", icon: "siReact", note: "Component-based interfaces.", source: [P] },
      { name: "n8n", icon: "siN8n", note: "Workflow automation: triggers, HTTP, code nodes, data tables, LLM chains.", source: [R("ai-agent-gunluk-teknoloji-bulteni")] },
      { name: "pandas", icon: "siPandas", note: "Tabular analysis of scraped data.", source: [R("AI-Driven-Crawling-Ingestion")] },
      { name: "matplotlib", note: "Charts for the analysis report.", source: [R("AI-Driven-Crawling-Ingestion")] },
      { name: "BeautifulSoup", note: "HTML parsing for the scraper.", source: [R("AI-Driven-Crawling-Ingestion")] },
      { name: "pytest", icon: "siPytest", note: "Unit, integration and end-to-end test layers.", source: [R("AI-Driven-Crawling-Ingestion")] },
    ],
  },
  {
    key: "armor",
    title: "Armour",
    subtitle: "Infrastructure & DevOps",
    flavor: "What keeps the lights on through the night.",
    items: [
      { name: "Linux", icon: "siLinux", note: "Home ground. Servers, shells and permissions.", source: [P] },
      { name: "Docker", icon: "siDocker", note: "Containers and Compose for reproducible environments.", source: [P, R("Restaurant-Management-System")] },
      { name: "Nginx", icon: "siNginx", note: "Reverse proxy and static serving.", source: [P, R("Restaurant-Management-System")] },
      { name: "Kubernetes", icon: "siKubernetes", note: "Deployment, Service and Ingress manifests.", source: [R("Restaurant-Management-System")] },
      { name: "Terraform", icon: "siTerraform", note: "Cloud resources declared as code.", source: [R("Restaurant-Management-System")] },
      { name: "Prometheus", icon: "siPrometheus", note: "Metrics scraping configuration.", source: [R("Restaurant-Management-System")] },
      { name: "AWS", note: "Cloud provider in the toolbelt.", source: [P] },
      { name: "Git", icon: "siGit", note: "Small commits, readable history.", source: [P] },
      { name: "GitHub", icon: "siGithub", note: "Where the work lives; Actions for generated profile art.", source: [P] },
      { name: "QEMU", icon: "siQemu", note: "Booting experimental kernels without touching real hardware.", source: [R("CreateOS")] },
      { name: "GRUB", note: "Multiboot loader for the kernel ISO.", source: [R("CreateOS")] },
      { name: "Make", note: "Build orchestration for cross-compiled code.", source: [R("CreateOS")] },
    ],
  },
  {
    key: "runes",
    title: "Runes",
    subtitle: "Databases & developer tools",
    flavor: "Small marks with large effects.",
    items: [
      { name: "PostgreSQL", icon: "siPostgresql", note: "Relational store of choice for services.", source: [P, R("Restaurant-Management-System")] },
      { name: "Redis", icon: "siRedis", note: "Cache and message broker.", source: [P, R("Restaurant-Management-System")] },
      { name: "SQLite", icon: "siSqlite", note: "Zero-ops database for local and embedded use.", source: [P] },
      { name: "Claude API", icon: "siClaude", note: "LLM calls for classification and writing inside automations.", source: [R("ai-agent-gunluk-teknoloji-bulteni")] },
      { name: "MCP", note: "Model Context Protocol servers exposing data as tools to coding agents.", source: [R("ai-agent-gunluk-teknoloji-bulteni")] },
      { name: "Telegram Bot API", icon: "siTelegram", note: "Delivery channel for digests and alerts.", source: [R("ai-agent-gunluk-teknoloji-bulteni")] },
      { name: "Neovim", icon: "siNeovim", note: "Terminal editor.", source: [P] },
      { name: "VS Code", note: "Editor for larger projects.", source: [P] },
      { name: "Markdown", icon: "siMarkdown", note: "Docs beside the code, always.", source: [P] },
    ],
  },
] as const;
