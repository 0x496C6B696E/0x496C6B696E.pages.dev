import type { Metadata } from "next";
import { AppWindow } from "@/components/ui/AppWindow";
import { Capabilities } from "@/components/skills/Capabilities";

export const metadata: Metadata = {
  title: "Capabilities · Skills",
  description: "Seven engineering disciplines with self-assessed levels: reliability, backend, infrastructure, systems, automation, architecture and security, each tied to public work.",
  alternates: { canonical: "/skills" },
};

export default function SkillsPage() {
  return (
    <AppWindow slug="skills" title="Capabilities" lede="Seven disciplines, each with a self-assessed level and a link to the public work that exercised it.">
      <Capabilities />
    </AppWindow>
  );
}
