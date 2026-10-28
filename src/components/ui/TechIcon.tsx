/**
 * Brand icons from Simple Icons (CC0 1.0, https://simpleicons.org).
 * Only the icons actually used are imported so the bundle stays small.
 * Technologies without a Simple Icons entry get a rune monogram instead.
 */
import {
  siC,
  siCelery,
  siClaude,
  siCplusplus,
  siDjango,
  siDocker,
  siFastapi,
  siGit,
  siGithub,
  siGnubash,
  siGo,
  siJavascript,
  siKubernetes,
  siLinux,
  siMarkdown,
  siN8n,
  siNeovim,
  siNginx,
  siNodedotjs,
  siPandas,
  siPostgresql,
  siPrometheus,
  siProton,
  siPytest,
  siPython,
  siQemu,
  siReact,
  siRedis,
  siRust,
  siSqlite,
  siTelegram,
  siTerraform,
  siTypescript,
  type SimpleIcon,
} from "simple-icons";
import { cn } from "@/lib/cn";

export const TECH_ICONS: Record<string, SimpleIcon> = {
  siC,
  siCelery,
  siClaude,
  siCplusplus,
  siDjango,
  siDocker,
  siFastapi,
  siGit,
  siGithub,
  siGnubash,
  siGo,
  siJavascript,
  siKubernetes,
  siLinux,
  siMarkdown,
  siN8n,
  siNeovim,
  siNginx,
  siNodedotjs,
  siPandas,
  siPostgresql,
  siPrometheus,
  siProton,
  siPytest,
  siPython,
  siQemu,
  siReact,
  siRedis,
  siRust,
  siSqlite,
  siTelegram,
  siTerraform,
  siTypescript,
};

export function monogram(name: string): string {
  const words = name.split(/[\s/]+/).filter(Boolean);
  const letters = words.length >= 2 ? words[0][0] + words[1][0] : name.replace(/[^A-Za-z0-9+#]/g, "").slice(0, 2);
  return letters.toUpperCase();
}

export function TechIcon({ icon, name, className }: { icon?: string; name: string; className?: string }) {
  const si = icon ? TECH_ICONS[icon] : undefined;
  if (!si) {
    return (
      <span className={cn("display grid place-items-center text-[0.7em] leading-none text-gold", className)} aria-hidden="true">
        {monogram(name)}
      </span>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true" focusable="false">
      <path d={si.path} />
    </svg>
  );
}
