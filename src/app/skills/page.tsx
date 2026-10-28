import type { Metadata } from "next";
import { Panel } from "@/components/ui/Panel";
import { CharacterSheet } from "@/components/skills/CharacterSheet";

export const metadata: Metadata = {
  title: "Character Sheet · Skills",
  description: "Engineering abilities as RPG attributes: reliability, backend engineering, infrastructure, systems programming, automation, architecture and security, each tied to public work.",
  alternates: { canonical: "/skills" },
};

export default function SkillsPage() {
  return (
    <Panel slug="skills" title="Character Sheet" lede="Seven attributes, each mapped to an engineering discipline and the public work that shows it.">
      <CharacterSheet />
    </Panel>
  );
}
