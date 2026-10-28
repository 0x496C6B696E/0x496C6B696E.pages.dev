import { Activity, Cpu, FileText, FolderGit2, Mail, Wrench, type LucideProps } from "lucide-react";
import type { ComponentType } from "react";
import type { Destination } from "@/config/site";

const ICONS: Record<Destination["icon"], ComponentType<LucideProps>> = {
  profile: FileText,
  skills: Cpu,
  projects: FolderGit2,
  stack: Wrench,
  stats: Activity,
  mail: Mail,
};

export function DestinationIcon({ icon, ...props }: { icon: Destination["icon"] } & LucideProps) {
  const Icon = ICONS[icon];
  return <Icon aria-hidden="true" {...props} />;
}
